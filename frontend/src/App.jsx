import React, { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import Signup from './components/SignUp.jsx';
import PassengerDashboard from './components/Layout.jsx';
import PilotDashboard from './components/PilotDashboard.jsx';
import EmployeeDashboard from './components/employeeDashboard.jsx';
import HomeNav from './components/HomeNav.jsx';
import HomeHero from './components/HomeHero.jsx';
import Ticker from './components/Ticker.jsx';

const App = () => {
  const updateView = (newView) => {
    setView(newView);
    localStorage.setItem('activeView', newView);
    window.history.pushState({ view: newView }, '', `#${newView}`);
  };

  const getInitialView = () => {
    const userId = localStorage.getItem('userID');

    if (!userId) return 'home';

    const savedView = localStorage.getItem('activeView');

    const validViews = [
      'home',
      'login',
      'passengerSignup',
      'passengerDashboard',
      'shiftCalendar',
      'employeeDashboard',
    ];

    if (savedView && validViews.includes(savedView)) {
      return savedView;
    }

    return 'passengerDashboard';
  };

  const [view, setView] = useState(getInitialView());
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userID'));

  useEffect(() => {
    const onPopState = () => {
      const savedView = localStorage.getItem('activeView');
      const userId = localStorage.getItem('userID');

      if (!userId) {
        setView('home');
        return;
      }

      setView(savedView || 'passengerDashboard');
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleLoginSuccess = (userData) => {
    let storedId = null;

    if (userData.user.role === 'passenger') {
      storedId = userData.user.account_id ?? userData.user.id;
      localStorage.setItem('activeView', 'passengerDashboard');
      setView('passengerDashboard');
    } else if (userData.user.role === 'pilot') {
      storedId = userData.user.employee_id ?? userData.user.id;
      localStorage.setItem('activeView', 'shiftCalendar');
      setView('shiftCalendar');
    } else if (userData.user.role === 'checkIn') {
      storedId = userData.user.employee_id ?? userData.user.id;
      localStorage.setItem('activeView', 'employeeDashboard');
      setView('employeeDashboard');
    } else {
      storedId = userData.user.account_id ?? userData.user.employee_id ?? userData.user.id;
      localStorage.setItem('activeView', 'home');
      setView('home');
    }

    if (storedId) {
      localStorage.setItem('userID', storedId);
      setCurrentUserId(storedId);
    }
  };

  const handlePassengerSignupSuccess = (userData) => {
    const storedId = userData.user.account_id ?? userData.user.id;
    localStorage.setItem('userID', storedId);
    setCurrentUserId(storedId);
    updateView('passengerDashboard');
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    localStorage.removeItem('userID');
    localStorage.removeItem('activeView');
    sessionStorage.clear();
    updateView('home');
  };

  return (
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

      {view === 'employeeDashboard' && (
        <EmployeeDashboard employeeId={currentUserId} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;