import { useEffect, useState } from 'react';

function FlightReports({ employeeId = 1 }) {
    const [pendingFlights, setPendingFlights] = useState([]);
    const [reports, setReports] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        hours_flown: '',
        distance_flown_km: '',
        status: 'Completed',
        irregular_reason: '',
        notes: ''
    });

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchPendingFlights = () => {
        fetch(`${API_URL}/api/pilot/flight_reports/pending?employee_id=${employeeId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch pending flights');
                }
                return res.json();
            })
            .then((data) => {
                setPendingFlights(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load flights needing reports.');
            });
    };

    const fetchReports = () => {
        fetch(`${API_URL}/api/pilot/flight_reports?employee_id=${employeeId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch flight reports');
                }
                return res.json();
            })
            .then((data) => {
                setReports(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load flight reports.');
            });
    };

    const handleSelectFlight = (flight) => {
        setSelectedFlight(flight);
        setSuccessMessage('');
        setError('');
        setFormData({
            hours_flown: '',
            distance_flown_km: '',
            status: 'Completed',
            irregular_reason: '',
            notes: ''
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedFlight) {
            setError('Please select a flight first.');
            return;
        }

        if (formData.status !== 'Completed' && !formData.irregular_reason.trim()) {
            setError('Please provide a reason for the irregular status.');
            return;
        }

        fetch(`${API_URL}/api/pilot/flight_reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employee_id: employeeId,
                flight_instance_id: selectedFlight.flight_instance_id,
                aircraft_id: selectedFlight.aircraft_id,
                ...formData
            })
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to submit flight report');
                }
                return res.json();
            })
            .then((data) => {
                setSuccessMessage(data.message || 'Flight report submitted successfully.');
                setError('');
                setSelectedFlight(null);
                setFormData({
                    hours_flown: '',
                    distance_flown_km: '',
                    status: 'Completed',
                    irregular_reason: '',
                    notes: ''
                });
                fetchPendingFlights();
                fetchReports();
            })
            .catch((err) => {
                console.error(err);
                setError('Could not submit flight report.');
            });
    };

    useEffect(() => {
        fetchPendingFlights();
        fetchReports();
    }, [API_URL, employeeId]);

    const totalHours = reports.reduce(
        (sum, report) => sum + (Number(report.hours_flown) || 0),
        0
    );

    const totalDist = reports.reduce(
        (sum, report) => sum + (Number(report.distance_flown_km) || 0),
        0
    );

    const irregularCnt = reports.filter(
        (report) => report.final_status && report.final_status !== 'Completed'
    ).length;

    return (
        <div className="page">
            <h2 style={{ textAlign: 'center', marginBottom: '6px', color: '#777' }}>
                Pilot Dashboard
            </h2>

            <h1 className="title">
                Flight Reports / Logs
            </h1>

            <p
                style={{
                    textAlign: 'center',
                    marginBottom: '24px',
                    marginTop: '0',
                    color: '#999',
                    fontSize: '16px'
                }}
            >
                Submit completed flights and view report history
            </p>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {successMessage && (
                <p style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>
            )}

            <div className="summary-cards">
                <div className="summary-card">
                    <h3>Total Logged Flights</h3>
                    <p>{reports.length}</p>
                </div>

                <div className="summary-card">
                    <h3>Total Hours Flown</h3>
                    <p>{totalHours.toFixed(1)}</p>
                </div>

                <div className="summary-card">
                    <h3>Total Distance Flown</h3>
                    <p>{totalDist.toFixed(0)}</p>
                </div>

                <div className="summary-card">
                    <h3>Irregular Flights</h3>
                    <p>{irregularCnt}</p>
                </div>
            </div>

            <div className="table-wrapper" style={{ marginTop: '30px' }}>
                <h2 className="title" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                    Flights Needing Reports
                </h2>

                <table className="shift-table">
                    <thead>
                        <tr>
                            <th>Flight</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Departure</th>
                            <th>Arrival</th>
                            <th>Aircraft</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingFlights.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>
                                    No flights currently need reports.
                                </td>
                            </tr>
                        ) : (
                            pendingFlights.map((flight, index) => (
                                <tr key={flight.flight_instance_id || index}>
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
                                    <td>{flight.aircraft_id || 'N/A'}</td>
                                    <td>
                                        <button
                                            className="action-button"
                                            onClick={() => handleSelectFlight(flight)}
                                        >
                                            Log Flight
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
                        Submit Flight Report
                    </h2>

                    <div className="summary-cards">
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
                            <h3>Aircraft</h3>
                            <p>{selectedFlight.aircraft_id || 'N/A'}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <input
                                type="number"
                                step="0.1"
                                name="hours_flown"
                                value={formData.hours_flown}
                                onChange={handleChange}
                                placeholder="Hours Flown"
                                required
                            />

                            <input
                                type="number"
                                step="0.1"
                                name="distance_flown_km"
                                value={formData.distance_flown_km}
                                onChange={handleChange}
                                placeholder="Distance Flown (km)"
                                required
                            />

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="Completed">Completed</option>
                                <option value="Delayed">Delayed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Diverted">Diverted</option>
                            </select>

                            {formData.status !== 'Completed' && (
                                <input
                                    type="text"
                                    name="irregular_reason"
                                    value={formData.irregular_reason}
                                    onChange={handleChange}
                                    placeholder="Reason for irregular status"
                                    required
                                />
                            )}

                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Additional notes"
                                rows="4"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="action-button">
                                    Submit Report
                                </button>

                                <button
                                    type="button"
                                    className="action-button"
                                    onClick={() => setSelectedFlight(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-wrapper" style={{ marginTop: '30px' }}>
                <h2 className="title" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                    Report History
                </h2>

                <table className="shift-table">
                    <thead>
                        <tr>
                            <th>Flight</th>
                            <th>Date</th>
                            <th>Aircraft</th>
                            <th>Hours</th>
                            <th>Distance (km)</th>
                            <th>Status</th>
                            <th>Reason</th>
                            <th>Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>
                                    No flight reports submitted yet.
                                </td>
                            </tr>
                        ) : (
                            reports.map((report, index) => (
                                <tr key={report.report_id || index}>
                                    <td>{report.flight_number || 'N/A'}</td>
                                    <td>
                                        {report.scheduled_departure_datetime
                                            ? new Date(report.scheduled_departure_datetime).toLocaleDateString()
                                            : 'N/A'}
                                    </td>
                                    <td>{report.aircraft_id || 'N/A'}</td>
                                    <td>{report.hours_flown || 'N/A'}</td>
                                    <td>{report.distance_flown_km || 'N/A'}</td>
                                    <td>{report.final_status || 'N/A'}</td>
                                    <td>{report.irregular_reason || '—'}</td>
                                    <td>
                                        {report.submitted_at
                                            ? new Date(report.submitted_at).toLocaleString()
                                            : 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default FlightReports;