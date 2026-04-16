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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    const initSession = () => {
      const storedId = localStorage.getItem('userID');
      const storedRole = localStorage.getItem('userRole');
      
      if (storedId && storedRole) {
        setCurrentUserId(storedId);
        setRole(storedRole);
      }
      setIsLoading(false);
    };
    initSession();
  }, []);

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

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={
          currentUserId ? (
            role === 'passenger' ? <Navigate to="/passenger-dashboard" /> : <Navigate to="/pilot-dashboard" />
          ) : (
            <>
              <HomeNav 
                isLoggedIn={false} 
                onLogoutClick={handleLogout} 
                onLoginClick={() => navigate('/login')} 
              />
              <HomeHero 
                isLoggedIn={false} 
                onSignUpClick={() => navigate('/signup')} 
              />
              <Ticker />
            </>
          )
        } />

        <Route path="/login" element={
          currentUserId ? (
            role === 'passenger' ? <Navigate to="/passenger-dashboard" /> : <Navigate to="/pilot-dashboard" />
          ) : (
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onSwitch={() => navigate('/signup')} 
            />
          )
        } />

        <Route path="/signup" element={
          currentUserId ? (
            role === 'passenger' ? <Navigate to="/passenger-dashboard" /> : <Navigate to="/pilot-dashboard" />
          ) : (
            <SignUp 
              onSwitch={() => navigate('/login')} 
              onSignupSuccess={() => navigate('/login')}
            />
          )
        } />

        <Route 
          path="/passenger-dashboard" 
          element={currentUserId && role === 'passenger' ? <PassengerDashboard userID={currentUserId} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/pilot-dashboard" 
          element={currentUserId && role === 'pilot' ? <PilotDashboard employeeId={currentUserId} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

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