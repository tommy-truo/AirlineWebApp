import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Login from './components/Login.jsx';
import Signup from './components/SignUp.jsx';
import PassengerDashboard from './components/Layout.jsx';
// IMPORT YALLS SPECIFIC COMPONENTS HERE
import PilotDashboard from './components/PilotDashboard.jsx'; //dex
import CabinCrewDashboard from './components/cabinCrewDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

const App = () => {
  // Initialize view from localStorage so the user stays logged in on refresh
  const [view, setView] = useState(localStorage.getItem('activeView') || 'login');
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userID'));

  // added by aya
  useEffect(() => {
    console.log('VIEW CHANGED TO:', view);
  }, [view]);

  // Function to handle successful passenger signup
  const handlePassengerSignupSuccess = (userData) => {
    console.log('Passenger signed up:', userData.user.id);
    localStorage.setItem('userID', userData.user.id);
    setCurrentUserId(userData.user.id);

    // Redirect to passenger dashboard after signup
    localStorage.setItem('activeView', 'passengerDashboard');
    setView('passengerDashboard');
  };

  // Function to handle successful login
  const handleLoginSuccess = (userData) => {
    console.log('User logged in:', userData.user);

    // added by aya
    localStorage.setItem('userRole', userData.user.role);

    // added by aya
    // FORCE PASSWORD CHANGE FIRST
    if (userData.user.must_change_password === 1) {
      localStorage.setItem('activeView', 'changePassword');
      setView('changePassword');
      localStorage.setItem('userID', userData.user.account_id);
      setCurrentUserId(userData.user.account_id);
      return;
    }

    let storedId = null;

    // ROLE-BASED REDIRECTION
    if (userData.user.role === 'passenger') {
      storedId = userData.user.account_id ?? userData.user.id;
      localStorage.setItem('activeView', 'passengerDashboard');
      setView('passengerDashboard');
    } 
    else if (userData.user.role === 'pilot') {
      storedId = userData.user.employee_id ?? userData.user.id;
      localStorage.setItem('activeView', 'shiftCalendar');
      setView('shiftCalendar');
    } 
    else if (userData.user.role === 'manager') {
      storedId = userData.user.employee_id ?? userData.user.account_id ?? userData.user.id;
      localStorage.setItem('activeView', 'managerDashboard');
      setView('managerDashboard');
    }
    else if(userData.user.role === 'flightcrew'){
      storedId = userData.user.employee_id ?? userData.user.id;
      localStorage.setItem('activeView', 'cabinCrewDashboard');
      setView('cabinCrewDashboard');
    }

    localStorage.setItem('userID', storedId);
    setCurrentUserId(storedId);
  };

  const handleLogout = () => {
    setView('login');
    setCurrentUserId(null);
    localStorage.removeItem('activeView');
    localStorage.removeItem('userID');

    // added by aya
    localStorage.removeItem('userRole');
  };

  return (
    <BrowserRouter>
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

        {/* 3. Passenger View */}
        {view === 'passengerDashboard' && (
          <PassengerDashboard userID={currentUserId} onLogout={handleLogout} />
        )}

      {/* pilot and cabincrew views*/}
      {view === 'shiftCalendar' && (
        <PilotDashboard employeeId={currentUserId} onLogout={handleLogout} />)}
      
      {view === 'cabinCrewDashboard' && (
      <CabinCrewDashboard employeeId={currentUserId} onLogout={handleLogout} />)}

        {/* 5. Manager View */}
        {/* added by aya */}
        {view === 'managerDashboard' && (
          <ManagerDashboard employeeId={currentUserId} onLogout={handleLogout} />
        )}

        {/* 6. Change Password View */}
        {/* added by aya */}
        {view === 'changePassword' && (
          <ChangePassword
            accountId={currentUserId}
            onSuccess={() => {
              const role = localStorage.getItem('userRole');

              if (role === 'manager') {
                localStorage.setItem('activeView', 'managerDashboard');
                setView('managerDashboard');
              } else if (role === 'pilot') {
                localStorage.setItem('activeView', 'shiftCalendar');
                setView('shiftCalendar');
              } else {
                localStorage.setItem('activeView', 'passengerDashboard');
                setView('passengerDashboard');
              }
            }}
          />
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;
