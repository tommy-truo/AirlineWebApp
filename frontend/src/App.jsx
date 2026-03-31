import React, { useState, useEffect } from 'react';
import Login from './components/Login.jsx';  
import Signup from './components/SignUp.jsx';
import PassengerDashboard from './components/Layout.jsx'; // Import your new layout

const App = () => {
  // Initialize view from localStorage so the user stays logged in on refresh
  const [view, setView] = useState(localStorage.getItem('activeView') || 'login');
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userID'));

  // Function to handle successful login
  const handleLoginSuccess = (userData) => {
    // You can store user details (like name or ID) in localStorage here if needed
    console.log("User logged in:", userData);
    localStorage.setItem('activeView', 'dashboard');
    localStorage.setItem('userID', userData.user.id);
    setCurrentUserId(userData.user.id); // Store user ID in state
    setView('dashboard');
  };

  const handleLogout = () => {
    setView('login');
    setCurrentUserId(null);
    localStorage.removeItem('activeView');
    localStorage.removeItem('userID');
  };

  return (
    <div className="app-container">
      {/* 1. Login View */}
      {view === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onSwitch={() => {
            setView('signup');
            localStorage.setItem('activeView', 'signup');
          }} 
        />
      )}

      {/* 2. Signup View */}
      {view === 'signup' && (
        <Signup 
          onSwitch={() => {
            setView('login');
            localStorage.setItem('activeView', 'login');
          }} 
        />
      )}

      {/* 3. Dashboard View (The Passenger Profile) */}
      {view === 'dashboard' && (
        <PassengerDashboard userID={currentUserId} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;