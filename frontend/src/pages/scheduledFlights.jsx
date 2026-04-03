import { useEffect, useState } from 'react';

function ScheduledFlights({ employeeId = 1 }) {
    const [flights, setFlights] = useState([]);
    const [error, setError] = useState('');
    const [selectedFlight, setSelectedFlight] = useState(null);

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
    }, [API_URL, employeeId]);

    const now = new Date();

    const upcomingFlights = flights.filter(
        (flight) => new Date(flight.scheduled_departure_datetime) >= now
    );

    const pastFlights = flights.filter(
        (flight) => new Date(flight.scheduled_departure_datetime) < now
    );

    const nextFlight = upcomingFlights.length > 0 ? upcomingFlights[0] : null;

    const renderFlightsTable = (flightList, emptyMessage) => (
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
                {flightList.length === 0 ? (
                    <tr>
                        <td colSpan="9" style={{ textAlign: 'center' }}>
                            {emptyMessage}
                        </td>
                    </tr>
                ) : (
                    flightList.map((flight, index) => (
                        <tr key={flight.assignment_id || index}>
                            <td>{flight.flight_number || 'N/A'}</td>
                            <td>
                                {flight.departure_country
                                    ? `${flight.departure_city}, ${flight.departure_country}`
                                    : flight.departure_city || 'N/A'}
                            </td>
                            <td>
                                {flight.arrival_country
                                    ? `${flight.arrival_city}, ${flight.arrival_country}`
                                    : flight.arrival_city || 'N/A'}
                            </td>
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
                                    onClick={() => setSelectedFlight(flight)}
                                >
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );

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

                <div className="summary-card">
                    <h3>Total Distance</h3>
                    <p>
                        {flights.reduce((sum, f) => sum + (f.estimated_distance_km || 0), 0)} km
                    </p>
                </div>
            </div>

            <div className="table-wrapper">
                <h2 className="title" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                    Upcoming Flights
                </h2>
                {renderFlightsTable(upcomingFlights, 'No upcoming flights.')}
            </div>

            <div className="table-wrapper" style={{ marginTop: '30px' }}>
                <h2 className="title" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                    Past Flights
                </h2>
                {renderFlightsTable(pastFlights, 'No past flights.')}
            </div>

            {selectedFlight && (
                <div className="table-wrapper" style={{ marginTop: '30px' }}>
                    <h2 className="title" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                        Flight Details
                    </h2>

                    <p><strong>Flight Number:</strong> {selectedFlight.flight_number || 'N/A'}</p>
                    <p>
                        <strong>Route:</strong>{' '}
                        {selectedFlight.departure_country
                            ? `${selectedFlight.departure_city}, ${selectedFlight.departure_country}`
                            : selectedFlight.departure_city || 'N/A'}
                        {' → '}
                        {selectedFlight.arrival_country
                            ? `${selectedFlight.arrival_city}, ${selectedFlight.arrival_country}`
                            : selectedFlight.arrival_city || 'N/A'}
                    </p>
                    <p>
                        <strong>Departure:</strong>{' '}
                        {selectedFlight.scheduled_departure_datetime
                            ? new Date(selectedFlight.scheduled_departure_datetime).toLocaleString()
                            : 'N/A'}
                    </p>
                    <p>
                        <strong>Arrival:</strong>{' '}
                        {selectedFlight.scheduled_arrival_datetime
                            ? new Date(selectedFlight.scheduled_arrival_datetime).toLocaleString()
                            : 'N/A'}
                    </p>
                    <p><strong>Distance:</strong> {selectedFlight.estimated_distance_km ?? 'N/A'} km</p>
                    <p><strong>Duration:</strong> {selectedFlight.estimated_duration_minutes ?? 'N/A'} min</p>
                    <p><strong>Aircraft:</strong> {selectedFlight.aircraft_id || 'N/A'}</p>

                    <button
                        className="action-button"
                        style={{ marginTop: '15px' }}
                        onClick={() => setSelectedFlight(null)}
                    >
                        Close Details
                    </button>
                </div>
            )}
        </div>
    );
}

export default ScheduledFlights;