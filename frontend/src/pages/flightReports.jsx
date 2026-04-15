import { useEffect, useState } from 'react';

function FlightReports({ employeeId = 1 }) {
    const [pendingFlights, setPendingFlights] = useState([]);
    const [reports, setReports] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);

    const [selectedReport, setSelectedReport] = useState(null);
    const [reportDetails, setReportDetails] = useState(null);
    const [loadingReportDetails, setLoadingReportDetails] = useState(false);

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

    const handleViewReport = async (report) => {
        setSelectedReport(report);
        setReportDetails(null);
        setLoadingReportDetails(true);
        setError('');

        try {
            const res = await fetch(
                `${API_URL}/api/pilot/flight_reports/${report.report_id}?employee_id=${employeeId}`
            );

            if (!res.ok) {
                throw new Error('Failed to fetch report details');
            }

            const data = await res.json();
            setReportDetails(data);
        } catch (err) {
            console.error(err);
            setError('Could not load report details.');
        } finally {
            setLoadingReportDetails(false);
        }
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
                            <th>Flight Number</th>
                            <th>Date Flown</th>
                            <th>Aircraft</th>
                            <th>Hours</th>
                            <th>Distance (km)</th>
                            <th>Status</th>
                            <th>Reason</th>
                            <th>Report Submitted On</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center' }}>
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
                                    <td>
                                        <button
                                            className="action-button"
                                            onClick={() => handleViewReport(report)}
                                        >
                                            View Report
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {selectedReport && (
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
                    onClick={() => {
                        setSelectedReport(null);
                        setReportDetails(null);
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: '18px',
                            padding: '32px',
                            width: 'min(900px, 92%)',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            boxShadow: '0 18px 45px rgba(0,0,0,0.18)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h1 style={{ marginTop: 0, marginBottom: '24px' }}>Report Details</h1>

                        {loadingReportDetails ? (
                            <p>Loading report details...</p>
                        ) : (
                            <>
                                <div className="summary-cards" style={{ marginBottom: '24px' }}>
                                    <div className="summary-card">
                                        <h3>Flight Number</h3>
                                        <p>{reportDetails?.flight_number || selectedReport.flight_number || 'N/A'}</p>
                                    </div>

                                    <div className="summary-card">
                                        <h3>Status</h3>
                                        <p>{reportDetails?.final_status || selectedReport.final_status || 'N/A'}</p>
                                    </div>

                                    <div className="summary-card">
                                        <h3>Date Flown</h3>
                                        <p>
                                            {reportDetails?.scheduled_departure_datetime
                                                ? new Date(reportDetails.scheduled_departure_datetime).toLocaleDateString()
                                                : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="summary-card">
                                        <h3>Report Submitted On</h3>
                                        <p>
                                            {reportDetails?.submitted_at
                                                ? new Date(reportDetails.submitted_at).toLocaleString()
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
                                    <p>
                                        <strong>Route:</strong>{' '}
                                        {(reportDetails?.departure_city || 'N/A') +
                                            ' → ' +
                                            (reportDetails?.arrival_city || 'N/A')}
                                    </p>
                                    <p>
                                        <strong>Departure:</strong>{' '}
                                        {reportDetails?.scheduled_departure_datetime
                                            ? new Date(reportDetails.scheduled_departure_datetime).toLocaleString()
                                            : 'N/A'}
                                    </p>
                                    <p>
                                        <strong>Arrival:</strong>{' '}
                                        {reportDetails?.scheduled_arrival_datetime
                                            ? new Date(reportDetails.scheduled_arrival_datetime).toLocaleString()
                                            : 'N/A'}
                                    </p>
                                    <p><strong>Aircraft:</strong> {reportDetails?.aircraft_id || 'N/A'}</p>
                                    <p><strong>Hours Flown:</strong> {reportDetails?.hours_flown || 'N/A'}</p>
                                    <p><strong>Distance:</strong> {reportDetails?.distance_flown_km || 'N/A'} km</p>
                                    <p><strong>Duration:</strong> {reportDetails?.estimated_duration || 'N/A'} min</p>
                                    <p><strong>Reason:</strong> {reportDetails?.irregular_reason || '—'}</p>
                                    <p><strong>Notes:</strong> {reportDetails?.notes || '—'}</p>
                                    <p>
                                        <p><strong>Crew Assigned:</strong></p>
                                        <ul>
                                            {reportDetails?.crew_assigned?.map((member, i) => (
                                                <li key={i}>{member}</li>
                                            ))}
                                        </ul>
                                    </p>
                                </div>
                            </>
                        )}

                        <button
                            className="action-button"
                            onClick={() => {
                                setSelectedReport(null);
                                setReportDetails(null);
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FlightReports;