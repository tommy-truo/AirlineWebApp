import React, { useState } from 'react';
import './Passenger.css';
import FlightSearch from '../features/search/FlightSearch';
import Profile from '../features/profile/Profile';
import MyBookings from '../features/bookings/MyBookings';
import LoyaltyPortal from '../features/loyaltyProgram/LoyaltyPortal';

const PassengerDashboard = ({ userID, onLogout }) => {
  const [activeTab, setActiveTab] = useState('search');

  // Static styles that don't change
  const sidebarStyle = {
    width: '250px',
    backgroundColor: '#3182ce', // Airlines Blue
    color: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    boxSizing: 'border-box',
  };

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#f4f4f9',
    fontFamily: 'sans-serif',
  };

  const handleSignOut = () => {
    onLogout();
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div style={containerStyle}>
      <nav style={sidebarStyle}>
        <h2 style={{ marginBottom: '30px', textAlign: 'center', color: 'white' }}>
          ACME Airlines
        </h2>
        
        <div className="nav-links" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Search Flights */}
          <button 
            style={{
              background: activeTab === 'search' ? 'white' : 'none',
              border: 'none',
              color: activeTab === 'search' ? '#3182ce' : '#ebf8ff',
              padding: '12px',
              textAlign: 'left',
              width: '100%',
              cursor: 'pointer',
              fontSize: '16px',
              borderRadius: '6px',
              marginBottom: '8px',
              fontWeight: activeTab === 'search' ? 'bold' : 'normal',
            }}
            onClick={() => setActiveTab('search')}
          >
            Search Flights
          </button>
          
          {/* My Trips */}
          <button 
            style={{
              background: activeTab === 'bookings' ? 'white' : 'none',
              border: 'none',
              color: activeTab === 'bookings' ? '#3182ce' : '#ebf8ff',
              padding: '12px',
              textAlign: 'left',
              width: '100%',
              cursor: 'pointer',
              fontSize: '16px',
              borderRadius: '6px',
              marginBottom: '8px',
              fontWeight: activeTab === 'bookings' ? 'bold' : 'normal',
            }}
            onClick={() => setActiveTab('bookings')}
          >
            My Trips
          </button>
          
          {/* Profile */}
          <button 
            style={{
              background: activeTab === 'profile' ? 'white' : 'none',
              border: 'none',
              color: activeTab === 'profile' ? '#3182ce' : '#ebf8ff',
              padding: '12px',
              textAlign: 'left',
              width: '100%',
              cursor: 'pointer',
              fontSize: '16px',
              borderRadius: '6px',
              marginBottom: '8px',
              fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
            }}
            onClick={() => setActiveTab('profile')}
          >
            Profile & Guests
          </button>

          {/* Loyalty */}
          <button 
            style={{
              background: activeTab === 'loyalty' ? 'white' : 'none',
              border: 'none',
              color: activeTab === 'loyalty' ? '#3182ce' : '#ebf8ff',
              padding: '12px',
              textAlign: 'left',
              width: '100%',
              cursor: 'pointer',
              fontSize: '16px',
              borderRadius: '6px',
              marginBottom: '8px',
              fontWeight: activeTab === 'loyalty' ? 'bold' : 'normal',
            }}
            onClick={() => setActiveTab('loyalty')}
          >
            Loyalty Program
          </button>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #63b3ed' }}>
          <button className="signout-button" onClick={handleSignOut}>
            Log Out
          </button>
        </div>
      </nav>

      <main className="main-content" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {activeTab === 'search' && <FlightSearch userID={userID} />}
        {activeTab === 'bookings' && (<MyBookings userID={userID} onNavigate={handleNavigate} />)}
        {activeTab === 'profile' && <Profile userID={userID} />}
        {activeTab === 'loyalty' && <LoyaltyPortal userID={userID} onNavigate={handleNavigate} />}
      </main>
    </div>
  );
};

export default PassengerDashboard;