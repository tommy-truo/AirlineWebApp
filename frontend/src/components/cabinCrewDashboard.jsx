import { useState, useEffect } from 'react';
import CabinCrewShiftCalendar from '../pages/cabinCrewShiftCalendar.jsx';
import CabinCrewScheduledFlights from '../pages/cabinCrewScheduledFlights.jsx';
import CabinCrewPersonalInfo from '../pages/cabinCrewPersonalInfo.jsx';
import CabinCrewFlightReports from '../pages/cabinCrewFlightReports.jsx';
import './PilotDashboard.css';

function CabinCrewDashboard({ employeeId, onLogout }) {
  const [page, setPage] = useState('shift');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchNotifications = async () => {
    if (!employeeId) return;

    try {
      setLoadingNotifications(true);

      const res = await fetch(`${API_URL}/api/employees/${employeeId}/notifications`);
      if (!res.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };


  useEffect(() => {
    fetchNotifications();
  }, [employeeId]);

  const handleMarkAsRead = async (notificationID) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationID === notificationID ? { ...n, isRead: 1 } : n
      )
    );

    try {
      await fetch(`${API_URL}/api/employees/notifications/${notificationID}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };


  return (
    <div className="portal-dashboard-layout">
      <aside className="portal-sidebar">
        <div>
          <div className="portal-sidebar-logo">ACME Airlines</div>
          <p className="portal-sidebar-subtitle">Cabin Crew Portal</p>

          <button
            className="portal-sidebar-button"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative', marginBottom: '10px' }}
          >
            🔔 Notifications
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span
                style={{
                  background: 'red',
                  color: 'white',
                  borderRadius: '999px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  marginLeft: '8px'
                }}
              >
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>

          <div className="portal-sidebar-nav">
            <button
              className={
                page === 'shift'
                  ? 'portal-sidebar-button active'
                  : 'portal-sidebar-button'
              }
              onClick={() => setPage('shift')}
            >
              Shift Calendar
            </button>

            <button
              className={
                page === 'flights'
                  ? 'portal-sidebar-button active'
                  : 'portal-sidebar-button'
              }
              onClick={() => setPage('flights')}
            >
              Scheduled Flights
            </button>

            <button
              className={
                page === 'personal'
                  ? 'portal-sidebar-button active'
                  : 'portal-sidebar-button'
              }
              onClick={() => setPage('personal')}
            >
              Personal Info
            </button>

            <button
              className={
                page === 'reports'
                  ? 'portal-sidebar-button active'
                  : 'portal-sidebar-button'
              }
              onClick={() => setPage('reports')}
            >
              Flight Reports / Logs
            </button>
          </div>
        </div>

        <button className="portal-logout-button" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="portal-dashboard-content">
        {showNotifications && (
          <div
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            <h3 style={{ marginTop: 0 }}>Notifications</h3>

            {notifications.length === 0 ? (
              <p style={{ color: '#777' }}>No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.notificationID}
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <strong>{n.title}</strong>
                  <p style={{ margin: '4px 0' }}>{n.message}</p>
                  <small style={{ color: '#999', display: 'block', marginBottom: '6px' }}>
                    {new Date(n.createdDatetime).toLocaleString()}
                  </small>

                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(n.notificationID)}
                      style={{
                        background: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        {page === 'shift' && <CabinCrewShiftCalendar employeeId={employeeId} />}
        {page === 'flights' && <CabinCrewScheduledFlights employeeId={employeeId} />}
        {page === 'personal' && <CabinCrewPersonalInfo employeeId={employeeId} />}
        {page === 'reports' && <CabinCrewFlightReports employeeId={employeeId} />}
      </main>
    </div>
  );
}

export default CabinCrewDashboard;