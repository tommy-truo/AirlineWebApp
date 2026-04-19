import React, { useState, useEffect } from 'react';

const NotificationsPage = ({ userID }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!userID) {
      console.log("Waiting for userID prop...");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch passengers to find the primary one
        const passRes = await fetch(`${url}/api/passengers/users/${userID}/passengers`);
        if (!passRes.ok) throw new Error('Failed to fetch account passengers');
        const passengers = await passRes.json();
        
        const primary = passengers.find(p => p.isPrimary === true);
        if (!primary) throw new Error('No primary passenger found for this account.');

        // 2. Fetch notifications using the primary passenger's ID
        const notifyRes = await fetch(`${url}/api/passengers/${primary.passengerId}/notifications`);
        if (!notifyRes.ok) throw new Error('Failed to fetch notifications');
        const notifyData = await notifyRes.json();

        // Sort and set state
        setNotifications(notifyData.sort((a, b) => 
          new Date(b.createdDatetime) - new Date(a.createdDatetime)
        ));

      } catch (err) {
        console.error("Error loading notifications page:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // 3. Set up the polling interval
    const interval = setInterval(loadData, 30000); 
    return () => clearInterval(interval);

  }, [userID, url]);

  const handleMarkAsRead = async (notificationID) => {
    // Optimistic UI update
    setNotifications(prev => 
      prev.map(n => n.notificationID === notificationID ? { ...n, isRead: 1 } : n)
    );

    try {
      await fetch(`${url}/api/passengers/notifications/${notificationID}/read`, {
        method: 'PATCH', // MUST be uppercase
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    } catch (err) {
      console.error("Failed to sync read status:", err);
    }
  };

  if (loading && notifications.length === 0) {
    return <p style={styles.center}>Loading your notifications...</p>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Your Notifications</h2>
        {error && <span style={styles.error}>{error}</span>}
      </div>

      {notifications.length === 0 ? (
        <div style={styles.emptyState}>No notifications yet!</div>
      ) : (
        <div style={styles.list}>
          {notifications.map((n) => (
            <div 
              key={n.notificationID} 
              style={{
                ...styles.card,
                borderLeft: n.isRead ? '4px solid #ccc' : '4px solid #007bff',
                backgroundColor: n.isRead ? '#f9f9f9' : '#fff'
              }}
            >
              <div style={styles.cardHeader}>
                <span style={styles.typeBadge}>{n.type}</span>
                <span style={styles.date}>{new Date(n.createdDatetime).toLocaleString()}</span>
              </div>
              <h3 style={styles.title}>{n.title}</h3>
              <p style={styles.message}>{n.message}</p>
              
              {!n.isRead && (
                <button 
                  onClick={() => handleMarkAsRead(n.notificationID)}
                  style={styles.readBtn}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  error: { color: '#d9534f', fontSize: '0.85rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'all 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  typeBadge: { fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold', color: '#666', background: '#eee', padding: '2px 8px', borderRadius: '4px' },
  date: { fontSize: '0.75rem', color: '#999' },
  title: { margin: '0 0 10px 0', fontSize: '1.1rem' },
  message: { margin: '0 0 15px 0', color: '#444', lineHeight: '1.4' },
  readBtn: { background: 'none', border: '1px solid #007bff', color: '#007bff', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  emptyState: { textAlign: 'center', padding: '50px', color: '#999', border: '2px dashed #eee', borderRadius: '12px' },
  center: { textAlign: 'center', marginTop: '50px' }
};

export default NotificationsPage;