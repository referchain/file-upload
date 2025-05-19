import React from 'react';
import './Profile.css';

const Profile: React.FC = () => {
  // Dummy user data for now
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    memberSince: '2023-01-15',
    // Add more user data fields as needed
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>User Profile</h2>
        <div className="profile-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member Since:</strong> {user.memberSince}</p>
          {/* Add more user info sections here */}
        </div>
        {/* Add more sections like transaction history, settings, etc. */}
      </div>
    </div>
  );
};

export default Profile;