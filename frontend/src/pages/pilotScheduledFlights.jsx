import { useEffect, useState } from 'react';

function PilotScheduledFlights({ employeeId = 1 }) {
    const [flights, setFlights] = useState([]);
    const [error, setError] = useState('');
    const [selectedFlight, setSelectedFlight] = useState(null);

    const [crewManifest, setCrewManifest] = useState([]);
    const [loadingCrew, setLoadingCrew] = useState(false);
    const [loadingFlights, setLoadingFlights] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL;
    useEffect(() => {

        fetch(`${API_URL}/api/pilot/scheduled_flights?employee_id=${employeeId}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch scheduled flights');
                return res.json();
            })
            .then((data) => {
                setFlights(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load scheduled flights.');
            })
            .finally(() => {
                setLoadingFlights(false);
            });
    }, [API_URL, employeeId]);

    const handleViewDetails = async (flight) => {
        setSelectedFlight(flight);
        setCrewManifest([]);
        setLoadingCrew(true);
        setError('');

        try {
            const res = await fetch(
                `${API_URL}/api/pilot/crew_manifest?employee_id=${employeeId}&flight_id=${flight.flight_instance_id}`
            );

            if (!res.ok) {
                throw new Error('Failed to fetch crew manifest');
            }

            const data = await res.json();
            setCrewManifest(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setCrewManifest([]);
        } finally {
            setLoadingCrew(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedFlight(null);
        setCrewManifest([]);
        setLoadingCrew(false);
    };

    const now = new Date();

    const upcomingFlights = flights
        .filter((f) => new Date(f.scheduled_departure_datetime) >= now)
        .sort(
            (a, b) =>
                new Date(a.scheduled_departure_datetime) -
                new Date(b.scheduled_departure_datetime)
        );

    const pastFlights = flights.filter(
        (f) => new Date(f.scheduled_departure_datetime) < now
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
                        <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ color: '#888' }}>
                                ✈️ {emptyMessage}
                            </div>
                        </td>
                    </tr>
                ) : (
                    flightList.map((flight, index) => (
                        <tr
                            key={flight.assignment_id || index}
                            style={{
                                background:
                                    flight.flight_instance_id === nextFlight?.flight_instance_id
                                        ? '#fff5f5'
                                        : 'transparent'
                            }}
                        >
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
                            <td>{flight.aircraft_name || `Aircraft ${flight.aircraft_id}`}</td>

                            <td>
                                <button
                                    className="action-button"
                                    onClick={() => handleViewDetails(flight)}
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
            <h2 style={{ textAlign: 'center', color: '#777' }}>
                Pilot Dashboard
            </h2>

            <h1 className="title">
                Scheduled Flights
            </h1>

            {error && (
                <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
            )}

            <div className="summary-cards">
                <div className="summary-card">
                    <h3>Upcoming Flights</h3>
                    <p>{upcomingFlights.length}</p>
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
                    <h3>Upcoming Distance</h3>
                    <p>
                        {upcomingFlights.reduce((sum, f) => sum + (f.estimated_distance_km || 0), 0)} km
                    </p>
                </div>

            {loadingFlights ? (
                <div className="table-wrapper" style={{ marginTop: '30px', textAlign: 'center' }}>
                    <h2>Scheduled Flights</h2>
                    <p style={{ color: '#666', padding: '30px 0' }}>Loading scheduled flights...</p>
                </div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <h2>Upcoming Flights</h2>
                        {renderFlightsTable(upcomingFlights, 'No upcoming flights.')}
                    </div>

                    <div className="table-wrapper" style={{ marginTop: '30px' }}>
                        <h2>Past Flights</h2>
                        {renderFlightsTable(pastFlights, 'No past flights.')}
                    </div>
                </>
            )}

            {selectedFlight && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}
                    onClick={handleCloseModal}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: '18px',
                            padding: '32px',
                            width: 'min(850px, 90%)',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            boxShadow: '0 18px 45px rgba(0,0,0,0.18)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Flight Details</h2>

                        <p><strong>Flight Number:</strong> {selectedFlight.flight_number || 'N/A'}</p>

                        <p>
                            <strong>Route:</strong>{' '}
                            {(selectedFlight.departure_city || 'N/A') +
                                ' → ' +
                                (selectedFlight.arrival_city || 'N/A')}
                        </p>

                        <p>
                            <strong>Scheduled Departure:</strong>{' '}
                            {selectedFlight.scheduled_departure_datetime
                                ? new Date(selectedFlight.scheduled_departure_datetime).toLocaleString()
                                : 'N/A'}
                        </p>

                        <p>
                            <strong>Scheduled Arrival:</strong>{' '}
                            {selectedFlight.scheduled_arrival_datetime
                                ? new Date(selectedFlight.scheduled_arrival_datetime).toLocaleString()
                                : 'N/A'}
                        </p>

                        <p><strong>Aircraft:</strong> {selectedFlight.aircraft_id || 'N/A'}</p>

                        <p>
                            <strong>Distance:</strong>{' '}
                            {selectedFlight.estimated_distance_km ?? 'N/A'} km
                        </p>

                        <p>
                            <strong>Estimated Duration:</strong>{' '}
                            {selectedFlight.estimated_duration_minutes ?? 'N/A'} min
                        </p>

                        <h3 style={{ marginTop: '28px', marginBottom: '12px' }}>
                            Crew Manifest
                        </h3>

                        {loadingCrew ? (
                            <p style={{ color: '#666' }}>Loading crew manifest...</p>
                        ) : crewManifest.length === 0 ? (
                            <p style={{ color: '#888' }}>No crew assigned yet.</p>
                        ) : (
                            (() => {
                                const roleOrder = [
                                    'Operating Captain',
                                    'Captain',
                                    'First Officer',
                                    'Co-Pilot',
                                    'Purser',
                                    'Cabin Crew'
                                ];

                                // Group crew by role
                                const grouped = {};

                                crewManifest.forEach((member) => {
                                    const role = member.assignment_role || 'Other';
                                    if (!grouped[role]) {
                                        grouped[role] = [];
                                    }
                                    grouped[role].push(member);
                                });

                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {roleOrder.map((role) =>
                                            grouped[role] ? (
                                                <div key={role}>
                                                    <strong style={{ color: '#b91c1c' }}>{role}:</strong>
                                                    <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                                                        {grouped[role].map((member, index) => (
                                                            <li key={member.employee_id || index}>
                                                                {member.first_name} {member.last_name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null
                                        )}
                                    </div>
                                );
                            })()
                        )}

                        <button
                            className="action-button"
                            onClick={handleCloseModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PilotScheduledFlights;
