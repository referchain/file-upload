import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Link } from 'react-router-dom'; // Import Link

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed up:', user);

      // Add user data to Firestore
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        myReferralCode: user.uid.substring(0, 6), // Generate a simple unique code (first 6 chars of UID)
        referredBy: null, // Will be updated if a valid referral code is used
        earnings: 0,
        rank: 'Bronze', // Default rank
        directReferrals: [],
        indirectReferrals: [], // Store indirect referrals up to 5 levels
        createdAt: new Date(),
      });

      // Implement referral code validation and linking logic
      if (referralCode) {
        const referrerQuery = query(collection(db, 'users'), where('myReferralCode', '==', referralCode));
        const referrerSnapshot = await getDocs(referrerQuery);

        if (!referrerSnapshot.empty) {
          const referrerDoc = referrerSnapshot.docs[0];
          const referrerRef = doc(db, 'users', referrerDoc.id);
          const referrerData = referrerDoc.data();

          // Add new user to referrer's direct referrals
          await updateDoc(referrerRef, {
            directReferrals: [...referrerData.directReferrals, user.uid]
          });

        // --- Commission Calculation Logic ---
        // Define commission rates based on rank and level (These should ideally be fetched from config or database)
        const commissionRates: { [key: string]: number[] } = {
          'Bronze': [0.05, 0.02, 0.01, 0.005, 0.002],
          'Silver': [0.07, 0.03, 0.015, 0.007, 0.003],
          'Gold': [0.10, 0.05, 0.02, 0.01, 0.005],
          // Add more ranks and rates as needed
        };

        const referrerRank = referrerData.rank || 'Bronze'; // Default to Bronze if rank is not set
        const directCommissionRate = commissionRates[referrerRank]?.[0] || 0; // Get rate for direct referral (Level 1)

        // Assuming a fixed commission amount for signup for now.
        // This should be based on a deposit or other action in a real application.
        const signupCommissionAmount = 10; // Example: $10 commission for a direct signup

        if (directCommissionRate > 0) {
          const commissionEarned = signupCommissionAmount * directCommissionRate;
          const updatedReferrerEarnings = (referrerData.earnings || 0) + commissionEarned;

          await updateDoc(referrerRef, {
            earnings: updatedReferrerEarnings
          });
          console.log(`Commission of ${commissionEarned} added to referrer ${referrerDoc.id} earnings.`);
        }
        // --- End Commission Calculation Logic ---

        // Update new user's document with referrer information
          const newUserQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
          const newUserSnapshot = await getDocs(newUserQuery);
          if (!newUserSnapshot.empty) {
            const newUserDoc = newUserSnapshot.docs[0];
            const newUserDocRef = doc(db, 'users', newUserDoc.id);
            await updateDoc(newUserDocRef, {
              referredBy: referrerDoc.id // Store referrer's document ID
            });

            // Implement indirect referral linking up to 5 levels
            let currentReferrerId = referrerDoc.id;
            for (let level = 1; level <= 5; level++) {
              if (!currentReferrerId) break;

              const currentReferrerDoc = await getDoc(doc(db, 'users', currentReferrerId));
              if (!currentReferrerDoc.exists()) break;

              const currentReferrerData = currentReferrerDoc.data();
              const updatedIndirectReferrals = currentReferrerData.indirectReferrals || [];

              // Ensure the array for the current level exists
              if (!updatedIndirectReferrals[level - 1]) {
                updatedIndirectReferrals[level - 1] = [];
              }

              // Add the new user's UID to the current level's array
              updatedIndirectReferrals[level - 1].push(user.uid);

              await updateDoc(doc(db, 'users', currentReferrerId), {
                indirectReferrals: updatedIndirectReferrals
              });

              // Move up to the next level's referrer
              currentReferrerId = currentReferrerData.referredBy;

              // Calculate and add commission for indirect referrer
              const indirectCommissionRate = commissionRates[currentReferrerData.rank || 'Bronze']?.[level] || 0; // Get rate for current level
              if (indirectCommissionRate > 0) {
                const indirectCommissionEarned = signupCommissionAmount * indirectCommissionRate;
                const updatedIndirectReferrerEarnings = (currentReferrerData.earnings || 0) + indirectCommissionEarned;

                await updateDoc(doc(db, 'users', currentReferrerId), {
                  earnings: updatedIndirectReferrerEarnings
                });
                console.log(`Commission of ${indirectCommissionEarned} added to indirect referrer ${currentReferrerId} earnings at level ${level + 1}.`);
              }
            }

          }

          console.log('User linked to referrer:', referrerDoc.id);
        } else {
          console.warn('Invalid referral code:', referralCode);
          // TODO: Handle invalid referral code (e.g., show error to user)
        }
      }

    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container"> {/* Use login-container for consistent background/centering */}
      <div className="login-card"> {/* Use login-card for consistent card styling */}
        <h2>Signup</h2>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="referralCode">Referral Code (Optional):</label>
            <input
              type="text"
              id="referralCode"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>
          <button type="submit" className="login-button">Sign Up</button> {/* Use login-button */}
        </form>
        {error && <p className="error">{error}</p>}
        <div className="signup-link"> {/* Use signup-link for consistent link styling */}
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;