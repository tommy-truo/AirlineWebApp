import React, { useState } from 'react';
import FlightSearch from '../features/search/FlightSearch';
import Profile from '../features/profile/Profile';
import MyBookings from '../features/bookings/MyBookings';
import LoyaltyPortal from '../features/loyaltyProgram/LoyaltyPortal';
import NotificationsPage from '../features/notifications/Notifications';

const PassengerDashboard = ({ userID, onLogout }) => {
  const [activeTab, setActiveTab] = useState('notifications');

  // Professional Red Color Palette
  const colors = {
    primaryRed: '#c63b3b',    // Main sidebar
    hoverRed: '#a32f2f',      // Button hover
    lightRed: '#fceaea',      // Active tab background
    textLight: '#fceaea',     // Subdued text
    white: '#ffffff'
  };

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#f4f4f9',
    fontFamily: 'sans-serif',
  };

  const sidebarStyle = {
    width: '260px',
    backgroundColor: colors.primaryRed,
    color: colors.white,
    padding: '25px 20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    boxSizing: 'border-box',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
  };

  // Helper for shared button styles
  const getNavButtonStyle = (isActive) => ({
    background: isActive ? colors.white : 'none',
    border: 'none',
    color: isActive ? colors.primaryRed : colors.textLight,
    padding: '14px 18px',
    textAlign: 'left',
    width: '100%',
    cursor: 'pointer',
    fontSize: '15px',
    borderRadius: '8px',
    marginBottom: '10px',
    fontWeight: isActive ? 'bold' : '500',
    transition: 'all 0.2s ease',
  });

  const signoutButtonStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glass effect
    color: colors.white,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '12px',
    textAlign: 'center',
    width: '100%',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    borderRadius: '8px',
    transition: '0.3s',
  };

  return (
    <div style={containerStyle}>
      <nav style={sidebarStyle}>
        <h2 style={{ 
          marginBottom: '40px', 
          textAlign: 'center', 
          letterSpacing: '1px',
          fontSize: '22px'
        }}>
          ACME AIRLINES
        </h2>
        
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <button 
            style={getNavButtonStyle(activeTab === 'notifications')}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>

          <button 
            style={getNavButtonStyle(activeTab === 'search')}
            onClick={() => setActiveTab('search')}
          >
            Search Flights
          </button>
          
          <button 
            style={getNavButtonStyle(activeTab === 'bookings')}
            onClick={() => setActiveTab('bookings')}
          >
            My Trips
          </button>
          
          <button 
            style={getNavButtonStyle(activeTab === 'profile')}
            onClick={() => setActiveTab('profile')}
          >
            Profile & Guests
          </button>

          <button 
            style={getNavButtonStyle(activeTab === 'loyalty')}
            onClick={() => setActiveTab('loyalty')}
          >
            Loyalty Program
          </button>
        </div>

        {/* Footer with Styled Logout */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <button 
            style={signoutButtonStyle}
            onClick={onLogout}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          >
            Log Out
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {activeTab === 'notifications' && <NotificationsPage userID={userID} />}
        {activeTab === 'search' && <FlightSearch userID={userID} />}
        {activeTab === 'bookings' && <MyBookings userID={userID} onNavigate={setActiveTab} />}
        {activeTab === 'profile' && <Profile userID={userID} />}
        {activeTab === 'loyalty' && <LoyaltyPortal userID={userID} onNavigate={setActiveTab} />}
      </main>
    </div>
  );
};

export default PassengerDashboard;