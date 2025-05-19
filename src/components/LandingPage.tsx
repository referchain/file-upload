import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate('/signup');
  };

  return (
    <div className="landing-page-container">
      {/* Navigation Bar */}
      <header className="landing-header">
        <nav className="landing-nav">
          {/* Logo */}
          <div className="landing-logo">PaisaChain</div>
          {/* Nav Links */}
          <div className="landing-nav-links">
            <a href="/login">Login</a>
            <a href="/signup">Sign Up</a>
          </div>
        </nav>
      </header>

      {/* Main Content Section */}
      <section className="landing-section main-content">
        <h1>Unlock Your Network's Potential</h1>
        <p>
          Turn your phone into a money machine — refer friends, earn
          commissions, and withdraw daily. Start your PaisaChain journey now!
        </p>
        <div className="landing-buttons">
          <button onClick={handleGetStartedClick}>Get Started Free</button>
          <button>Access Your Dashboard</button>
        </div>
      </section>

      {/* Why Choose PaisaChain Section */}
      <section className="landing-section why-choose">
        <h2>Why Choose PaisaChain?</h2>
        <ul className="landing-features-list">
          <li>✓ See your network grow — visually and effortlessly.</li>
          <li>✓ Predict your income like a pro with our earnings simulator.</li>
          <li>✓ Grow smarter, faster — powered by AI-driven strategies.</li>
          <li>✓ Share your referral code in seconds, earn for life.</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>©2025 PaisaChain. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;