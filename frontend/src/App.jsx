/* Abhishek Singh - ACME App */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login.jsx';  
import SignUp from './components/SignUp.jsx';
import HomeNav from './components/HomeNav.jsx';
import HomeHero from './components/HomeHero.jsx';
import Ticker from './components/Ticker.jsx';
import PassengerDashboard from './components/Layout.jsx';
import PilotDashboard from './components/PilotDashboard.jsx'; 

const AppContent = () => {
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userID'));
  const [role, setRole] = useState(localStorage.getItem('userRole'));
  const navigate = useNavigate(); 

  const handleLoginSuccess = (userData) => {
    const storedId = userData.user.account_id ?? userData.user.employee_id ?? userData.user.id;
    const userRole = userData.user.role;

    localStorage.setItem('userID', storedId);
    localStorage.setItem('userRole', userRole);
    
    setCurrentUserId(storedId);
    setRole(userRole);

    if (userRole === 'passenger') {
      navigate('/passenger-dashboard');
    } else {
      navigate('/pilot-dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUserId(null);
    setRole(null);
    navigate('/');
  };

  return (
    <div className="app-container">
      <Routes>
        {/* LANDING PAGE(HOmepage) */}
        <Route path="/" element={
          <>
            <HomeNav 
              isLoggedIn={!!currentUserId} 
              onLogoutClick={handleLogout} 
              onLoginClick={() => navigate('/login')} 
            />
            <HomeHero 
              isLoggedIn={!!currentUserId} 
              onSignUpClick={() => navigate('/signup')} 
            />
            <Ticker />
          </>
        } />

        {/* LOGIN PAGE */}
        <Route path="/login" element={
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onSwitch={() => navigate('/signup')} 
          />
        } />

        {/* SIGNUP PAGE */}
        <Route path="/signup" element={
          <SignUp 
            onSwitch={() => navigate('/login')} 
            onSignupSuccess={() => navigate('/login')}
          />
        } />

        {/* DASHBOARDS */}
        <Route 
          path="/passenger-dashboard" 
          element={currentUserId && role === 'passenger' ? <PassengerDashboard userID={currentUserId} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/pilot-dashboard" 
          element={currentUserId && role === 'pilot' ? <PilotDashboard employeeId={currentUserId} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;