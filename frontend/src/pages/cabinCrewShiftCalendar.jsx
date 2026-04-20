import { useEffect, useState } from 'react';

function CabinCrewShiftCalendar({ employeeId = 54 }) {
    const [shifts, setShifts] = useState([]);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [requestType, setRequestType] = useState('');
    const [selectedShift, setSelectedShift] = useState(null);
    const [reason, setReason] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredDeparture, setPreferredDeparture] = useState('');
    const [preferredArrival, setPreferredArrival] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [requests, setRequests] = useState([]);
    const [requestError, setRequestError] = useState('');
    const [swapOptions, setSwapOptions] = useState([]);
    const [selectedSwapAssignment, setSelectedSwapAssignment] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    if (!employeeId) {
        return (
            <div className="page">
                <h2 style={{ textAlign: 'center', color: '#777' }}>
                    Loading Cabin Crew Data...
                </h2>
            </div>
        );
    }

    useEffect(() => {
        fetch(`${API_URL}/api/cabin_crew/shift_calendar?employee_id=${employeeId}`)
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
        fetch(`${API_URL}/api/cabin_crew/shift_requests?employee_id=${employeeId}`)
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
        setPreferredDate('');
        setPreferredDeparture('');
        setPreferredArrival('');
        setSwapOptions([]);
        setSelectedSwapAssignment('');
    };

    const fetchSwapOptions = (date) => {
        if (!date || requestType !== 'swap' || !selectedShift) return;

        fetch(
            `${API_URL}/api/cabin_crew/swap_options?employee_id=${employeeId}&assignment_id=${selectedShift}&preferred_date=${date}`
        )
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch swap options');
                }
                return res.json();
            })
            .then((data) => {
                setSwapOptions(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load swap options.');
            });
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
            reason: reason.trim(),
            preferred_date: preferredDate,
            preferred_departure_airport_id: preferredDeparture,
            preferred_arrival_airport_id: preferredArrival,
            requested_swap_assignment_id: selectedSwapAssignment || null,
            preferred_date: preferredDate || null,
        };

        fetch(`${API_URL}/api/cabin_crew/submit_request`, {
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
                setPreferredDate('');
                setPreferredDeparture('');
                setPreferredArrival('');
                setError('');
                fetchShiftRequests();
            })
            .catch((err) => {
                console.error(err);
                setError('Could not submit request.');
            });
    };

    const renderShiftsTable = (shiftList, emptyMessage) => (
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
                {shiftList.length === 0 ? (
                    <tr>
                        <td colSpan="11" style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ color: '#888' }}>
                                ✈️ {emptyMessage}
                            </div>
                        </td>
                    </tr>
                ) : (
                    shiftList.map((shift, index) => (
                        <tr key={shift.shift_id || index}>
                            <td>{shift.shift_date
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
                                <span style={{
                                    display: 'inline-block',
                                    padding: '6px 10px',
                                    borderRadius: '999px',
                                    background: '#f3f3f3',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
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
    );

    return (
        <div className="page">
            <h2 style={{ textAlign: 'center', marginBottom: '6px', color: '#777' }}>
                Cabin Crew
            </h2>

            <h1 className="title" style={{ marginBottom: '4px' }}>
                {shifts[0]
                    ? `${shifts[0].first_name} ${shifts[0].last_name}`
                    : 'Cabin Crew'}
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
                {shifts[0]?.assignment_role || 'Cabin Crew'} • Shift Calendar
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
                    <h3>Next Trip</h3>
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
                {renderShiftsTable(upcomingShifts, 'No upcoming shifts assigned yet.')}
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

                    {(requestType === 'add' || requestType === 'swap') && (
                        <input
                            type="date"
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                marginBottom: '10px'
                            }}
                        />
                    )}

                    {requestType === 'add' && (
                        <>
                            <select
                                value={preferredDeparture}
                                onChange={(e) => setPreferredDeparture(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    marginBottom: '10px'
                                }}
                            >
                                <option value="">Preferred Departure Airport</option>
                                <option value="1">Houston (IAH)</option>
                                <option value="2">Dallas (DFW)</option>
                                <option value="3">New York (JFK)</option>
                            </select>

                            <select
                                value={preferredArrival}
                                onChange={(e) => setPreferredArrival(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    marginBottom: '15px'
                                }}
                            >
                                <option value="">Optional Destination</option>
                                <option value="1">Houston (IAH)</option>
                                <option value="2">Dallas (DFW)</option>
                                <option value="3">New York (JFK)</option>
                            </select>
                        </>
                    )}

                    {requestType === 'swap' && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                Available Swap Options
                            </label>

                            {swapOptions.length === 0 ? (
                                <p style={{ color: '#777', margin: 0 }}>
                                    No swap options found for that date yet.
                                </p>
                            ) : (
                                <select
                                    value={selectedSwapAssignment}
                                    onChange={(e) => setSelectedSwapAssignment(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #ccc',
                                        marginBottom: '10px'
                                    }}
                                >
                                    <option value="">Select a shift to swap with</option>
                                    {swapOptions.map((option) => (
                                        <option key={option.assignment_id} value={option.assignment_id}>
                                            {option.first_name} {option.last_name} • {option.phone_number || option.email || 'No contact'} • {option.flight_number} • {option.departure_city} → {option.arrival_city}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

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
    );
}

export default CabinCrewShiftCalendar;