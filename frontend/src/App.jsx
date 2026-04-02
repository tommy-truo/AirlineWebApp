import React, { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import Signup from './components/SignUp.jsx';
import PassengerDashboard from './components/Layout.jsx';
// IMPORT YALLS SPECIFIC COMPONENTS HERE
import ShiftCalendar from './pages/shiftCalendar.jsx'; //dex
import ScheduledFlights from './pages/scheduledFlights.jsx'; //dex
import PersonalInfo from './pages/personalInfo.jsx'; //dex

const App = () => {
  // Initialize view from localStorage so the user stays logged in on refresh
  const [view, setView] = useState(localStorage.getItem('activeView') || 'login');
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userID'));

  // Function to handle successful passenger signup
  const handlePassengerSignupSuccess = (userData) => {
    console.log("Passenger signed up:", userData.user.id);
    localStorage.setItem('userID', userData.user.id);
    setCurrentUserId(userData.user.id); // Store user ID in state

    // Redirect to passenger dashboard after signup
    localStorage.setItem('activeView', 'passengerDashboard');
    setView('passengerDashboard');
  };

  // Function to handle successful login
  const handleLoginSuccess = (userData) => {
    console.log("User logged in:", userData.user);

    let storedId = userData.user.id;

    // ROLE-BASED REDIRECTION
    if (userData.user.role === 'passenger') { // FOR PASSENGER ACCOUNTS
      storedId = userData.user.account_id ?? userData.user.id;
      localStorage.setItem('activeView', 'passengerDashboard');
      setView('passengerDashboard');
    }
    else if (userData.user.role === 'pilot') {
      storedId = userData.user.employee_id ?? userData.user.id;
      localStorage.setItem('activeView', 'shiftCalendar');
      setView('shiftCalendar');
    }

    localStorage.setItem('userID', storedId);
    setCurrentUserId(storedId);
  };

  const handleLogout = () => {
    setView('login');
    setCurrentUserId(null);
    localStorage.removeItem('activeView');
    localStorage.removeItem('userID');
  };

  // SPECIFY YOUR COMPONENTS AND THEIR VIEW NAME BELOW, FOLLOWING THE EXAMPLE OF LOGIN, SIGNUP, PASSENGER DASHBOARD
  return (
    <div className="app-container">
      {/* 1. Login View */}
      {view === 'login' && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitch={() => {
            setView('passengerSignup');
            localStorage.setItem('activeView', 'passengerSignup');
          }}
        />
      )}

      {/* 2. Passenger Signup View */}
      {view === 'passengerSignup' && (
        <Signup
          onSignupSuccess={handlePassengerSignupSuccess}
          onSwitch={() => {
            setView('login');
            localStorage.setItem('activeView', 'login');
          }}
        />
      )}

      {/* 3. Passenger View (The Passenger Profile) */}
      {view === 'passengerDashboard' && (
        <PassengerDashboard userID={currentUserId} onLogout={handleLogout} />
      )}

      {view === 'shiftCalendar' && (
        <ShiftCalendar employeeId={currentUserId} />
      )}

      {view === 'scheduledFlights' && (
        <ScheduledFlights employeeId={currentUserId} />
      )}

      {view === 'personalInfo' && (
        <PersonalInfo employeeId={currentUserId} />
      )}

    </div>
  );
};

export default App;
