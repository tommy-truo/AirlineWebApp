import { useEffect, useState } from 'react';

function PilotShiftCalendar({ employeeId = 1 }) {
    const [shifts, setShifts] = useState([]);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [requestType, setRequestType] = useState('');
    const [selectedShift, setSelectedShift] = useState(null);
    const [reason, setReason] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [requests, setRequests] = useState([]);
    const [requestError, setRequestError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetch(`${API_URL}/api/pilot/shift_calendar?employee_id=${employeeId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch shift data');
                }
                return res.json();
            })
            .then((data) => {
                console.log('SHIFT DATA:', data);
                setShifts(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load shift data.');
            });
    }, [API_URL, employeeId]);

    const fetchShiftRequests = () => {
        fetch(`${API_URL}/api/pilot/shift_requests?employee_id=${employeeId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch shift requests');
                }
                return res.json();
            })
            .then((data) => {
                setRequests(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setRequestError('Could not load shift request history.');
            });
    };

    useEffect(() => {
        fetchShiftRequests();
    }, [API_URL, employeeId]);

    const now = new Date();

    const upcomingShifts = shifts
        .filter((shift) => new Date(shift.scheduled_departure_datetime) >= now)
        .sort(
            (a, b) =>
                new Date(a.scheduled_departure_datetime) -
                new Date(b.scheduled_departure_datetime)
        );


    const nextFlight = upcomingShifts.length > 0 ? upcomingShifts[0] : null;

    const openRequestForm = (type, shiftId) => {
        setRequestType(type);
        setSelectedShift(shiftId);
        setReason('');
        setSuccessMessage('');
        setError('');
        setShowForm(true);
    };

    const handleSubmitRequest = (e) => {
        e.preventDefault();

        if (!reason.trim()) {
            setError('A reason for your shift request is required before submission.');
            return;
        }

        const payload = {
            employee_id: employeeId,
            assignment_id: selectedShift,
            request_type: requestType,
            reason: reason.trim()
        };

        fetch(`${API_URL}/api/pilot/submit_request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to submit request');
                }
                return res.json();
            })
            .then((data) => {
                console.log('Request submitted:', data);
                setSuccessMessage('Request submitted successfully.');
                setShowForm(false);
                setReason('');
                setError('');
                fetchShiftRequests();
            })
            .catch((err) => {
                console.error(err);
                setError('Could not submit request.');
            });
    };

    return (
        <>
            <div className="page">
                <h2 style={{ textAlign: 'center', marginBottom: '6px', color: '#777' }}>
                    Shift Calendar
                </h2>

                <h1 className="title" style={{ marginBottom: '4px' }}>
                    {upcomingShifts[0]
                        ? `${upcomingShifts[0].first_name} ${upcomingShifts[0].last_name}`
                        : shifts[0]
                            ? `${shifts[0].first_name} ${shifts[0].last_name}`
                            : 'Pilot'}
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
                    {upcomingShifts[0]?.assignment_role || shifts[0]?.assignment_role || 'Pilot'} • Shift Calendar
                </p>

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {successMessage && (
                    <p style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>
                )}

                <div className="summary-cards">
                    <div className="summary-card">
                        <h3>Total Upcoming Shifts</h3>
                        <p>{upcomingShifts.length}</p>
                    </div>

                    <div className="summary-card">
                        <h3>Next Flight</h3>
                        <p>{nextFlight?.flight_number || 'N/A'}</p>
                    </div>

                    <div className="summary-card">
                        <h3>Next Departure</h3>
                        <p>{nextFlight?.departure_city || nextFlight?.start_location || 'N/A'}</p>
                    </div>

                    <div className="summary-card">
                        <h3>Total Upcoming Hours</h3>
                        <p>
                            {upcomingShifts.reduce((sum, shift) => {
                                const start = new Date(`1970-01-01T${shift.start_time}`);
                                const end = new Date(`1970-01-01T${shift.end_time}`);
                                return sum + (end - start) / (1000 * 60 * 60);
                            }, 0).toFixed(1)}
                        </p>
                    </div>
                </div>

                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <button
                        className="action-button"
                        onClick={() => openRequestForm('add', null)}
                    >
                        Request Added Shift
                    </button>
                </div>

                <div className="table-wrapper">
                    <h2 className="title" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                        Upcoming Shifts
                    </h2>

                    <table className="shift-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Day</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Flight</th>
                                <th>Aircraft</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingShifts.length === 0 ? (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center' }}>
                                        No upcoming shifts.
                                    </td>
                                </tr>
                            ) : (
                                upcomingShifts.map((shift, index) => (
                                    <tr key={shift.shift_id || index}>
                                        <td>
                                            {shift.shift_date
                                                ? new Date(shift.shift_date).toLocaleDateString()
                                                : shift.day
                                                    ? new Date(shift.day).toLocaleDateString()
                                                    : 'N/A'}
                                        </td>
                                        <td>{shift.day_name || 'N/A'}</td>
                                        <td>{shift.start_time ? String(shift.start_time).slice(0, 5) : 'N/A'}</td>
                                        <td>{shift.end_time ? String(shift.end_time).slice(0, 5) : 'N/A'}</td>
                                        <td>{shift.departure_city || shift.start_location || 'N/A'}</td>
                                        <td>{shift.arrival_city || 'N/A'}</td>
                                        <td>{shift.flight_number || 'N/A'}</td>
                                        <td>{shift.aircraft_name || `Aircraft ${shift.aircraft_id}`}</td>
                                        <td>{shift.assignment_role || 'N/A'}</td>
                                        <td>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '6px 10px',
                                                    borderRadius: '999px',
                                                    background: '#f3f3f3',
                                                    fontSize: '14px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {shift.flight_status || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <button
                                                    className="action-button"
                                                    style={{ backgroundColor: '#3498db', color: 'white', border: 'none' }}
                                                    onClick={() => openRequestForm('swap', shift.shift_id)}
                                                >
                                                    Swap
                                                </button>
                                                <button
                                                    className="action-button"
                                                    style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none' }}
                                                    onClick={() => openRequestForm('drop', shift.shift_id)}
                                                >
                                                    Drop
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


                <div className="table-wrapper" style={{ marginTop: '30px' }}>
                    <h2 className="title" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                        Shift Request History
                    </h2>

                    {requestError && (
                        <p style={{ color: 'red', textAlign: 'center' }}>{requestError}</p>
                    )}

                    <table className="shift-table">
                        <thead>
                            <tr>
                                <th>Request Type</th>
                                <th>Flight</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Submitted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center' }}>
                                        No shift requests yet.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((request, index) => (
                                    <tr key={request.shift_request_id || index}>
                                        <td>
                                            {request.request_type === 'add'
                                                ? 'Picked Up Shift'
                                                : request.request_type === 'drop'
                                                    ? 'Dropped Shift'
                                                    : 'Swap Request'}
                                        </td>
                                        <td>{request.flight_number || 'N/A'}</td>
                                        <td>{request.departure_city || 'N/A'}</td>
                                        <td>{request.arrival_city || 'N/A'}</td>
                                        <td>{request.reason || 'N/A'}</td>
                                        <td>{request.status || 'N/A'}</td>
                                        <td>
                                            {request.submitted_datetime
                                                ? new Date(request.submitted_datetime).toLocaleString()
                                                : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {showForm && (
                    <form
                        onSubmit={handleSubmitRequest}
                        className="request-form"
                        style={{
                            marginTop: '30px',
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 6px 18px rgba(0,0,0,0.08)'
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>
                            {requestType.toUpperCase()} Shift Request
                        </h3>

                        <p style={{ color: '#666', marginBottom: '10px' }}>
                            A reason for your request is required before submission.
                        </p>

                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason for request (required)"
                            rows="4"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                marginBottom: '15px',
                                boxSizing: 'border-box'
                            }}
                            required
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                className="action-button"
                                disabled={!reason.trim()}
                                style={{
                                    opacity: reason.trim() ? 1 : 0.6,
                                    cursor: reason.trim() ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Submit Request
                            </button>
                            <button
                                type="button"
                                className="action-button"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

export default PilotShiftCalendar;