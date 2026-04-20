import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Login from './components/Login.jsx';
import Signup from './components/SignUp.jsx';
import PassengerDashboard from './components/Layout.jsx';
import PilotDashboard from './components/PilotDashboard.jsx';
import CabinCrewDashboard from './components/cabinCrewDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import ManagerChangePassword from './pages/ManagerChangePassword.jsx';
import EmployeeDashboard from './components/employeeDashboard.jsx';
import MaintenanceDashboard from './components/MaintenanceDashboard.jsx';
import HomeNav from './components/HomeNav.jsx';
import HomeHero from './components/HomeHero.jsx';
import Ticker from './components/Ticker.jsx';

const validViews = [
  'home',
  'login',
  'passengerSignup',
  'passengerDashboard',
  'shiftCalendar',
  'cabinCrewDashboard',
  'maintenanceDashboard',
  'managerDashboard',
  'changePassword',
  'employeeDashboard',
];

const getInitialView = () => {
  const userId = localStorage.getItem('userID');
  const savedView = localStorage.getItem('activeView');

  if (!userId) return 'home';
  return validViews.includes(savedView) ? savedView : 'home';
};

const App = () => {
  const [view, setView] = useState(getInitialView());
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userID'));

  useEffect(() => {
    if (!validViews.includes(view)) {
      localStorage.setItem('activeView', 'home');
      setView('home');
    }
  }, [view]);

  const updateView = (newView) => {
    setView(newView);
    localStorage.setItem('activeView', newView);
    window.history.pushState({ view: newView }, '', `#${newView}`);
  };

  const handlePassengerSignupSuccess = (userData) => {
    const storedId = userData.user.account_id ?? userData.user.id;
    localStorage.setItem('userID', storedId);
    setCurrentUserId(storedId);
    updateView('passengerDashboard');
  };

  const handleLoginSuccess = (userData) => {
    const role = userData.user.role;
    localStorage.setItem('userRole', role);

    if (userData.user.must_change_password === 1) {
      const accountId = userData.user.account_id ?? userData.user.id;
      localStorage.setItem('userID', accountId);
      setCurrentUserId(accountId);
      updateView('changePassword');
      return;
    }

    let storedId = userData.user.account_id ?? userData.user.employee_id ?? userData.user.id;
    let nextView = 'home';

    if (role === 'passenger') {
      storedId = userData.user.account_id ?? userData.user.id;
      nextView = 'passengerDashboard';
    } else if (role === 'pilot') {
      storedId = userData.user.employee_id ?? userData.user.id;
      nextView = 'shiftCalendar';
    } else if (role === 'manager') {
      storedId = userData.user.employee_id ?? userData.user.account_id ?? userData.user.id;
      nextView = 'managerDashboard';
    } else if (role === 'flightcrew') {
      storedId = userData.user.employee_id ?? userData.user.id;
      nextView = 'cabinCrewDashboard';
    } else if (role === 'checkIn') {
      storedId = userData.user.employee_id ?? userData.user.id;
      nextView = 'employeeDashboard';
    } else if (role === 'maintenance') {
      storedId = userData.user.employee_id ?? userData.user.id;
      nextView = 'maintenanceDashboard';
    }

    localStorage.setItem('userID', storedId);
    setCurrentUserId(storedId);
    updateView(nextView);
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    localStorage.removeItem('activeView');
    localStorage.removeItem('userID');
    localStorage.removeItem('userRole');
    sessionStorage.clear();
    setView('home');
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {view === 'home' && (
          <>
            <HomeNav
              onLoginClick={() => updateView('login')}
              onSignupClick={() => updateView('passengerSignup')}
            />
            <HomeHero onSignupClick={() => updateView('passengerSignup')} />
            <Ticker />
          </>
        )}

        {view === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitch={() => updateView('passengerSignup')}
          />
        )}

        {view === 'passengerSignup' && (
          <Signup
            onSignupSuccess={handlePassengerSignupSuccess}
            onSwitch={() => updateView('login')}
          />
        )}

        {view === 'passengerDashboard' && (
          <PassengerDashboard userID={currentUserId} onLogout={handleLogout} />
        )}

        {view === 'shiftCalendar' && (
          <PilotDashboard employeeId={currentUserId} onLogout={handleLogout} />
        )}

        {view === 'cabinCrewDashboard' && (
          <CabinCrewDashboard employeeId={currentUserId} onLogout={handleLogout} />
        )}

        {view === 'maintenanceDashboard' && (
          <MaintenanceDashboard employeeId={currentUserId} onLogout={handleLogout} />
        )}

        {view === 'managerDashboard' && (
          <ManagerDashboard employeeId={currentUserId} onLogout={handleLogout} />
        )}

        {view === 'changePassword' && (
          <ManagerChangePassword
            accountId={currentUserId}
            onSuccess={() => {
              const role = localStorage.getItem('userRole');

              if (role === 'manager') {
                updateView('managerDashboard');
              } else if (role === 'pilot') {
                updateView('shiftCalendar');
              } else if (role === 'flightcrew') {
                updateView('cabinCrewDashboard');
              } else if (role === 'checkIn') {
                updateView('employeeDashboard');
              } else if (role === 'maintenance') {
                updateView('maintenanceDashboard');
              } else {
                updateView('passengerDashboard');
              }
            }}
          />
        )}

        {view === 'employeeDashboard' && (
          <EmployeeDashboard employeeId={currentUserId} onLogout={handleLogout} />
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;