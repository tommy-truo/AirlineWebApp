import { useEffect, useState } from 'react';

function ScheduledFlights({ employeeId = 1 }) {
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState('');

  //const API_URL = 'https://airline-web-app.onrender.com';
    //const API_URL = 'http://localhost:5001';
    const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {

    fetch(`${API_URL}/api/pilot/scheduled_flights?employee_id=${employeeId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch scheduled flights');
        }
        return res.json();
      })
      .then((data) => {
        setFlights(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load scheduled flights.');
      });
  }, []);

  const nextFlight = flights.length > 0 ? flights[0] : null;

  return (
    <div className="page">
      <h2 style={{ textAlign: 'center', marginBottom: '6px', color: '#777' }}>
        Pilot Dashboard
      </h2>

      <h1 className="title" style={{ marginBottom: '4px' }}>
        Scheduled Flights
      </h1>

      <p
        style={{
          textAlign: 'center',
          color: '#999',
          fontSize: '16px',
          marginTop: '0',
          marginBottom: '24px'
        }}
      >
        Flight Assignments Overview
      </p>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Flights</h3>
          <p>{flights.length}</p>
        </div>

        <div className="summary-card">
          <h3>Next Flight</h3>
          <p>{nextFlight?.flight_number || 'N/A'}</p>
        </div>

        <div className="summary-card">
          <h3>Next Route</h3>
          <p>
            {nextFlight
              ? `${nextFlight.departure_city} → ${nextFlight.arrival_city}`
              : 'N/A'}
          </p>
        </div>
      </div>

      <div className="summary-card">
        <h3>Total Distance</h3>
        <p>
          {flights.reduce((sum, f) => sum + (f.estimated_distance_km || 0), 0)} km
        </p>
      </div>

      <div className="table-wrapper">
        <table className="shift-table">
          <thead>
            <tr>
              <th>Flight</th>
              <th>From</th>
              <th>To</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Distance (km)</th>
              <th>Duration (min)</th>
              <th>Aircraft</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight, index) => (
              <tr key={flight.assignment_id || index}>
                <td>{flight.flight_number || 'N/A'}</td>
                <td>{flight.departure_city || 'N/A'}</td>
                <td>{flight.arrival_city || 'N/A'}</td>
                <td>
                  {flight.scheduled_departure_datetime
                    ? new Date(flight.scheduled_departure_datetime).toLocaleString()
                    : 'N/A'}
                </td>
                <td>
                  {flight.scheduled_arrival_datetime
                    ? new Date(flight.scheduled_arrival_datetime).toLocaleString()
                    : 'N/A'}
                </td>
                <td>{flight.estimated_distance_km ?? 'N/A'}</td>
                <td>{flight.estimated_duration_minutes ?? 'N/A'}</td>
                <td>{flight.aircraft_id || 'N/A'}</td>
                <td>
                  <button
                    className="action-button"
                    style={{ backgroundColor: '#3498db', color: 'white', border: 'none' }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ScheduledFlights;