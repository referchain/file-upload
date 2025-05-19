import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          {/* TODO: Add Dashboard and other routes */}
          <Route path="/" element={<LandingPage />} /> {/* Default route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
