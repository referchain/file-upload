import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { User } from 'firebase/auth';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directReferralDetails, setDirectReferralDetails] = useState<any[]>([]);
  const [indirectReferralDetails, setIndirectReferralDetails] = useState<any[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number | ''>('');
  const [depositAmount, setDepositAmount] = useState<number | ''>('');

  const handleWithdrawal = async () => {
    if (withdrawalAmount === '' || withdrawalAmount <= 0) {
      alert('Please enter a valid positive amount to withdraw.');
      return;
    }
    if (!userData || withdrawalAmount > userData.earnings) {
      alert('Insufficient funds.');
      return;
    }

    try {
      // Add withdrawal transaction to Firestore
      await addDoc(collection(db, 'transactions'), {
        uid: user?.uid,
        type: 'withdrawal',
        amount: withdrawalAmount,
        status: 'pending', // Or 'completed' depending on your flow
        timestamp: new Date(),
      });

      // Update user's earnings in Firestore
      const userDocRef = doc(db, 'users', user!.uid);
      await updateDoc(userDocRef, {
        earnings: userData.earnings - withdrawalAmount,
      });

      alert(`Withdrawal of ${withdrawalAmount} requested.`);
      setWithdrawalAmount(''); // Clear input after request
      // Optionally, refetch user data to update the display
      // fetchUserData(); // You might need a separate function for this
    } catch (error: any) {
      console.error('Error during withdrawal:', error);
      alert('Withdrawal failed: ' + error.message);
    }
  };

  const handleDeposit = async () => {
    if (depositAmount === '' || depositAmount <= 0) {
      alert('Please enter a valid positive amount to deposit.');
      return;
    }
    if (!userData) {
      alert('User data not loaded.');
      return;
    }

    try {
      // Add deposit transaction to Firestore
      await addDoc(collection(db, 'transactions'), {
        uid: user?.uid,
        type: 'deposit',
        amount: depositAmount,
        status: 'completed', // Deposits are typically completed immediately
        timestamp: new Date(),
      });

      // Update user's earnings in Firestore
      const userDocRef = doc(db, 'users', user!.uid);
      await updateDoc(userDocRef, {
        earnings: (userData.earnings || 0) + depositAmount,
      });

      alert(`Deposit of ${depositAmount} requested.`);
      setDepositAmount(''); // Clear input after request
      // Optionally, refetch user data to update the display
      // fetchUserData(); // You might need a separate function for this
    } catch (error: any) {
      console.error('Error during deposit:', error);
      alert('Deposit failed: ' + error.message);
    }
  };

  const fetchUsersByUids = async (uids: string[]) => {
    if (uids.length === 0) return [];
    // Firestore 'in' query has a limit of 10
    const usersData: any[] = [];
    const chunkSize = 10;
    for (let i = 0; i < uids.length; i += chunkSize) {
      const chunk = uids.slice(i, i + chunkSize);
      const usersQuery = query(collection(db, 'users'), where('uid', 'in', chunk));
      const usersSnapshot = await getDocs(usersQuery);
      usersSnapshot.forEach(doc => {
        usersData.push(doc.data());
      });
    }
    return usersData;
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData(data);

            // Fetch details for direct referrals
            if (data.directReferrals && data.directReferrals.length > 0) {
              fetchUsersByUids(data.directReferrals).then(setDirectReferralDetails);
            }

            // Fetch details for indirect referrals
            if (data.indirectReferrals && data.indirectReferrals.length > 0) {
              const allIndirectUids = data.indirectReferrals.flat();
              const uniqueIndirectUids = Array.from(new Set(allIndirectUids));
              fetchUsersByUids(uniqueIndirectUids).then(details => {
                // Structure the fetched details back into the original indirect referral structure
                const structuredDetails = data.indirectReferrals.map((levelReferrals: string[]) =>
                  levelReferrals.map(uid => details.find(user => user.uid === uid) || { uid })
                );
                setIndirectReferralDetails(structuredDetails);
              });
            }

          } else {
            setError('User data not found in Firestore.');
          }
        } catch (err: any) {
          setError(err.message);
        }
      } else {
        setUser(null);
        setUserData(null);
        // TODO: Redirect to login page if not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!user) {
    return <div>Please log in to view the dashboard.</div>; // Should redirect to login
  }

  return (
    <div>
      <h2>Dashboard</h2>
      {userData ? (
        <>
          <div className="card">
            <p>Welcome, {user.email}</p>
            <p>Total Earnings: {userData.earnings}</p>
            <p>Rank: {userData.rank}</p>
            <p>Your Referral Code: {userData.myReferralCode}</p>
          </div>

          <div className="card">
            <h3>Referrals</h3>
            <h4>Direct Referrals ({userData.directReferrals?.length || 0})</h4>
            {userData.directReferrals && userData.directReferrals.length > 0 ? (
              <ul>
                {userData.directReferrals.map((referralUid: string) => (
                  <li key={referralUid}>{directReferralDetails.find(user => user.uid === referralUid)?.email || referralUid}</li>
                ))}
              </ul>
            ) : (
              <p>No direct referrals yet.</p>
            )}

            <h4>Indirect Referrals</h4>
            {userData.indirectReferrals && userData.indirectReferrals.length > 0 ? (
              <div>
                {userData.indirectReferrals.map((levelReferrals: string[], index: number) => (
                  levelReferrals.length > 0 && (
                    <div key={index}>
                      <h5>Level {index + 1} ({levelReferrals.length})</h5>
                      <ul>
                        {levelReferrals.map((referralUid: string) => (
                          <li key={referralUid}>{indirectReferralDetails[index]?.find((user: any) => user.uid === referralUid)?.email || referralUid}</li>
                        ))}
                      </ul>
                    </div>
                  )
                ))
              }</div>
            ) : (
              <p>No indirect referrals yet.</p>
            )}
          </div>

          {/* Withdrawal Section */}
          <div className="card">
            <h3>Withdrawal</h3>
            <div className="form-group">
              <input
                type="number"
                placeholder="Amount to withdraw"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value))}
              />
            </div>
            <button onClick={handleWithdrawal}>Request Withdrawal</button>
          </div>

          {/* Deposit Section */}
          <div className="card">
            <h3>Deposit</h3>
            <div className="form-group">
              <input
                type="number"
                placeholder="Amount to deposit"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
              />
            </div>
            <button onClick={handleDeposit}>Request Deposit</button>
          </div>

        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Dashboard;