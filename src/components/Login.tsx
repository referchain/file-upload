import React, { useState } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import { auth } from '../firebaseConfig'; // Import auth
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'; // Import sendPasswordResetEmail and signInWithEmailAndPassword
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Import GoogleAuthProvider and signInWithPopup

const Login: React.FC = () => {
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input

  const handleForgotPassword = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Prevent default link behavior
    if (!email) {
      alert('Please enter your email address to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      alert('Failed to send password reset email: ' + error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Handle successful sign-in (e.g., redirect to dashboard)
      alert('Google Sign-in successful!');
      // You might want to redirect the user here, e.g., navigate('/dashboard');
    } catch (error: any) {
      console.error('Error during Google Sign-in:', error);
      alert('Google Sign-in failed: ' + error.message);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Handle successful sign-in (e.g., redirect to dashboard)
      alert('Email/Password Sign-in successful!');
      // You might want to redirect the user here, e.g., navigate('/dashboard');
    } catch (error: any) {
      console.error('Error during Email/Password Sign-in:', error);
      alert('Email/Password Sign-in failed: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="app-logo">PaisaChain</div>
        <h2>Login to PaisaChain</h2>
        <p>Access your dashboard and manage your network.</p>
        <form onSubmit={handleEmailPasswordLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <a href="#" className="forgot-password" onClick={handleForgotPassword}>Forgot password?</a>
          </div>
          <button type="submit" className="login-button">Login with Email</button>
        </form>
        <div className="or-divider">OR CONTINUE WITH</div>
        <button className="social-button google-button" onClick={handleGoogleSignIn}>
          {/* <img src="/google-icon.svg" alt="Google Icon" /> */} Sign in with Google
        </button>
        <button className="social-button phone-button">
          {/* <img src="/phone-icon.svg" alt="Phone Icon" /> */} Sign in with Phone
        </button>
        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
      <div className="return-link">
        <Link to="/">Return to Landing Page</Link>
      </div>
    </div>
  );
};

export default Login;