import { useEffect, useState } from 'react';

function ScheduledFlights({ employeeId = 1 }) {
    const [flights, setFlights] = useState([]);
    const [error, setError] = useState('');

    const [selectedFlight, setSelectedFlight] = useState(null);
    const [crewManifest, setCrewManifest] = useState([]);
    const [crewError, setCrewError] = useState('');
    const [loadingCrew, setLoadingCrew] = useState(false);

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

    const handleViewDetails = (flight) => {
        setSelectedFlight(flight);
        setCrewManifest([]);
        setCrewError('');
        setLoadingCrew(true);

        // Use whichever ID your backend actually returns
        const flightId =
            flight.flight_instance_id ||
            flight.flight_id ||
            flight.assignment_id;

        fetch(
            `${API_URL}/api/pilot/crew_manifest?employee_id=${employeeId}&flight_id=${flightId}`
        )
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch crew manifest');
                }
                return res.json();
            })
            .then((data) => {
                setCrewManifest(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setCrewError('Could not load crew manifest.');
            })
            .finally(() => {
                setLoadingCrew(false);
            });
    };

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
                            ? `${nextFlight.departure_city || 'N/A'} → ${nextFlight.arrival_city || 'N/A'}`
                            : 'N/A'}
                    </p>
                </div>

                <div className="summary-card">
                    <h3>Total Distance</h3>
                    <p>
                        {flights.reduce((sum, f) => sum + (Number(f.estimated_distance_km) || 0), 0)} km
                    </p>
                </div>
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
                        {flights.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center' }}>
                                    No scheduled flights found.
                                </td>
                            </tr>
                        ) : (
                            flights.map((flight, index) => (
                                <tr key={flight.assignment_id || flight.flight_instance_id || index}>
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
                                    <td>{flight.aircraft_id || flight.aircraft_model || 'N/A'}</td>
                                    <td>
                                        <button
                                            className="action-button"
                                            style={{
                                                backgroundColor: '#3498db',
                                                color: 'white',
                                                border: 'none'
                                            }}
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
            </div>

            {selectedFlight && (
                <div className="table-wrapper" style={{ marginTop: '30px' }}>
                    <h2 className="title" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                        Flight Details & Crew Manifest
                    </h2>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '15px',
                            marginBottom: '25px'
                        }}
                    >
                        <div className="summary-card">
                            <h3>Flight</h3>
                            <p>{selectedFlight.flight_number || 'N/A'}</p>
                        </div>

                        <div className="summary-card">
                            <h3>Route</h3>
                            <p>
                                {(selectedFlight.departure_city || 'N/A') +
                                    ' → ' +
                                    (selectedFlight.arrival_city || 'N/A')}
                            </p>
                        </div>

                        <div className="summary-card">
                            <h3>Departure</h3>
                            <p>
                                {selectedFlight.scheduled_departure_datetime
                                    ? new Date(selectedFlight.scheduled_departure_datetime).toLocaleString()
                                    : 'N/A'}
                            </p>
                        </div>

                        <div className="summary-card">
                            <h3>Aircraft</h3>
                            <p>{selectedFlight.aircraft_id || selectedFlight.aircraft_model || 'N/A'}</p>
                        </div>
                    </div>

                    {loadingCrew && (
                        <p style={{ textAlign: 'center', color: '#777' }}>Loading crew manifest...</p>
                    )}

                    {crewError && (
                        <p style={{ color: 'red', textAlign: 'center' }}>{crewError}</p>
                    )}

                    {!loadingCrew && !crewError && (
                        <table className="shift-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                {crewManifest.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center' }}>
                                            No crew members found for this flight.
                                        </td>
                                    </tr>
                                ) : (
                                    crewManifest.map((crew, index) => (
                                        <tr key={index}>
                                            <td>
                                                {crew.first_name || ''} {crew.last_name || ''}
                                            </td>
                                            <td>
                                                {crew.assignment_role ||
                                                    crew.role ||
                                                    crew.title_name ||
                                                    'N/A'}
                                            </td>
                                            <td>{crew.department_name || 'N/A'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default ScheduledFlights;