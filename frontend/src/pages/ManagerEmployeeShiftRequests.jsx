import { useEffect, useState } from 'react'
import "../components/ManagerStyles.css";

function EmployeeRequest() {

    const [requests, setRequests] = useState([])
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchRequests()
    }, [])

    function fetchRequests() {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        fetch(`${API_BASE_URL}/api/requests`)
            .then(res => res.json())
            .then(data => setRequests(data))
            .catch(() => setError('Error loading requests'))
    }

    function formatDateTime(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    }

    function handleUpdate(id, status) {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        fetch(`${API_BASE_URL}/api/requests/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        })
            .then(res => res.json())
            .then(() => {
                setMessage('Request updated')
                setError('')
                fetchRequests()
            })
            .catch(() => {
                setError('Error updating request')
                setMessage('')
            })
    }

    return (
        <div className="container-fluid form-wrapper">

            <div className="card signup-container shadow-sm border-danger">
                <div className="card-body">

                    <h2 className="form-title mb-3">Employee Shift Requests</h2>

                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div style={{ overflowX: 'auto' }}>
                        <table className="table table-bordered">

                            <thead className="table-light">
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Job Title</th>
                                    <th>Flight</th>
                                    <th>Type</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {requests.map(r => (
                                    <tr key={r.shift_request_id}>
                                        <td>{r.employee_name}</td>
                                        <td>{r.department_name}</td>
                                        <td>{r.title_name}</td>
                                        <td>{r.flight_number || '—'}</td>
                                        <td>{r.request_type}</td>
                                        <td>{r.reason}</td>
                                        <td>
                                            <span className={`status-badge ${r.status === 'Approved'
                                                ? 'status-approved'
                                                : r.status === 'Denied'
                                                    ? 'status-denied'
                                                    : 'status-pending'
                                                }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td>{formatDateTime(r.submitted_datetime)}</td>

                                        <td>
                                            {r.status === 'Pending' ? (
                                                <>
                                                    <button
                                                        className="btn btn-success mx-1"
                                                        onClick={() => handleUpdate(r.shift_request_id, 'Approved')}
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        className="btn btn-danger mx-1"
                                                        onClick={() => handleUpdate(r.shift_request_id, 'Denied')}
                                                    >
                                                        Deny
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-muted">Reviewed</span>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default EmployeeRequest
