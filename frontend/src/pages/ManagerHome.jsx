import { useEffect, useState } from 'react'
import '../components/styles.css'

function ManagerHome() {
  const [stats, setStats] = useState({
    employees: 0,
    activeEmployees: 0,
    flights: 0,
    requests: 0,
    assignments: 0
  })

  const [employeesData, setEmployeesData] = useState([])
  const [flightsData, setFlightsData] = useState([])
  const [requestsData, setRequestsData] = useState([])
  const [assignmentsData, setAssignmentsData] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    Promise.all([
      fetch(`${API_BASE_URL}/api/employees`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/flights/all`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/requests`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/assignments`).then(res => res.json())
    ])
      .then(([employees, flights, requests, assignments]) => {
        const safeEmployees = Array.isArray(employees) ? employees : []
        const safeFlights = Array.isArray(flights) ? flights : []
        const safeRequests = Array.isArray(requests) ? requests : []
        const safeAssignments = Array.isArray(assignments) ? assignments : []

        const pendingRequests = safeRequests.filter(
          request => request.status === 'Pending'
        ).length

        const activeEmployees = safeEmployees.filter(
          employee => Number(employee.is_active) === 1
        ).length

        setEmployeesData(safeEmployees)
        setFlightsData(safeFlights)
        setRequestsData(safeRequests)
        setAssignmentsData(safeAssignments)

        setStats({
          employees: safeEmployees.length,
          activeEmployees,
          flights: safeFlights.length,
          requests: pendingRequests,
          assignments: safeAssignments.length
        })

        setLoading(false)
      })
      .catch(() => {
        setError('Error loading dashboard overview.')
        setLoading(false)
      })
  }, [])

  function formatDateTime(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString()
  }

  function isFutureDate(dateString) {
    if (!dateString) return false
    return new Date(dateString) > new Date()
  }

  const flightsNeedingAttention = flightsData
    .filter((flight) =>
      ['Delayed', 'Cancelled'].includes(flight.status_name)
    )
    .slice(0, 5)

  const upcomingFlights = flightsData
    .filter((flight) =>
      isFutureDate(flight.scheduled_departure_datetime) &&
      !['Arrived', 'Cancelled'].includes(flight.status_name)
    )
    .sort(
      (a, b) =>
        new Date(a.scheduled_departure_datetime) -
        new Date(b.scheduled_departure_datetime)
    )
    .slice(0, 5)

  const recentRequests = requestsData
    .slice()
    .sort(
      (a, b) =>
        new Date(b.submitted_datetime) - new Date(a.submitted_datetime)
    )
    .slice(0, 5)

  const upcomingAssignments = assignmentsData
    .filter((assignment) => isFutureDate(assignment.scheduled_departure_datetime))
    .sort(
      (a, b) =>
        new Date(a.scheduled_departure_datetime) -
        new Date(b.scheduled_departure_datetime)
    )
    .slice(0, 5)

  return (
    <div className="container-fluid form-wrapper">
      <div className="card signup-container shadow-sm border-danger">
        <div className="card-body">

          <h2 className="form-title mb-3">Manager Overview</h2>
          <p className="text-muted text-center mb-4">
            Welcome to the ACME Airlines management dashboard.
          </p>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="row mt-2">
            <div className="col-md-6 col-xl-3 mb-3">
              <div className="overview-card h-100">
                <p className="overview-label">Total Employees</p>
                <h3 className="overview-value">{loading ? '...' : stats.employees}</h3>
              </div>
            </div>

            <div className="col-md-6 col-xl-3 mb-3">
              <div className="overview-card h-100">
                <p className="overview-label">Active Employees</p>
                <h3 className="overview-value">{loading ? '...' : stats.activeEmployees}</h3>
              </div>
            </div>

            <div className="col-md-6 col-xl-3 mb-3">
              <div className="overview-card h-100">
                <p className="overview-label">Pending Requests</p>
                <h3 className="overview-value">{loading ? '...' : stats.requests}</h3>
              </div>
            </div>

            <div className="col-md-6 col-xl-3 mb-3">
              <div className="overview-card h-100">
                <p className="overview-label">Assignments</p>
                <h3 className="overview-value">{loading ? '...' : stats.assignments}</h3>
              </div>
            </div>
          </div>

          <hr />

          <div className="form-section mt-4">
            <h5 className="form-title text-center mb-3">Flights Needing Attention</h5>

            <div style={{ overflowX: 'auto' }}>
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Flight</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Scheduled Departure</th>
                  </tr>
                </thead>

                <tbody>
                  {flightsNeedingAttention.length > 0 ? (
                    flightsNeedingAttention.map((flight) => (
                      <tr key={flight.flight_instance_id}>
                        <td>{flight.flight_number}</td>
                        <td>{flight.departure_city} → {flight.arrival_city}</td>
                        <td>{flight.status_name}</td>
                        <td>{flight.reason_name || '—'}</td>
                        <td>{formatDateTime(flight.scheduled_departure_datetime)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No flights currently need attention.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <hr />

          <div className="form-section mt-4">
            <h5 className="form-title text-center mb-3">Upcoming Flights</h5>

            <div style={{ overflowX: 'auto' }}>
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Flight</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Scheduled Departure</th>
                    <th>Scheduled Arrival</th>
                  </tr>
                </thead>

                <tbody>
                  {upcomingFlights.length > 0 ? (
                    upcomingFlights.map((flight) => (
                      <tr key={flight.flight_instance_id}>
                        <td>{flight.flight_number}</td>
                        <td>{flight.departure_city} → {flight.arrival_city}</td>
                        <td>{flight.status_name}</td>
                        <td>{formatDateTime(flight.scheduled_departure_datetime)}</td>
                        <td>{formatDateTime(flight.scheduled_arrival_datetime)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No upcoming flights found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <hr />

          <div className="row mt-4">
            <div className="col-lg-6 mb-4">
              <div className="form-section h-100">
                <h5 className="form-title text-center mb-3">Recent Requests</h5>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>Flight</th>
                        <th>Status</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentRequests.length > 0 ? (
                        recentRequests.map((request) => (
                          <tr key={request.shift_request_id}>
                            <td>{request.employee_name}</td>
                            <td>{request.request_type}</td>
                            <td>{request.flight_number || '—'}</td>
                            <td>{request.status}</td>
                            <td>{formatDateTime(request.submitted_datetime)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No recent requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div className="form-section h-100">
                <h5 className="form-title text-center mb-3">Upcoming Crew Assignments</h5>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Employee</th>
                        <th>Assignment Type</th>
                        <th>Flight</th>
                        <th>Route</th>
                        <th>Departure</th>
                      </tr>
                    </thead>

                    <tbody>
                      {upcomingAssignments.length > 0 ? (
                        upcomingAssignments.map((assignment) => (
                          <tr key={assignment.assignment_id}>
                            <td>{assignment.employee_name}</td>
                            <td>{assignment.type_name || '—'}</td>
                            <td>{assignment.flight_number}</td>
                            <td>{assignment.departure_city} → {assignment.arrival_city}</td>
                            <td>{formatDateTime(assignment.scheduled_departure_datetime)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No upcoming assignments found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ManagerHome
