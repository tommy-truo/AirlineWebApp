import { useEffect, useState } from 'react'
import '../components/styles.css'

function ManagerHome() {
  const [stats, setStats] = useState({
    employees: 0,
    flights: 0,
    requests: 0,
    assignments: 0
  })

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
        const pendingRequests = Array.isArray(requests)
          ? requests.filter(request => request.status === 'Pending').length
          : 0

        setStats({
          employees: Array.isArray(employees) ? employees.length : 0,
          flights: Array.isArray(flights) ? flights.length : 0,
          requests: pendingRequests,
          assignments: Array.isArray(assignments) ? assignments.length : 0
        })
        setLoading(false)
      })
      .catch(() => {
        setError('Error loading dashboard overview.')
        setLoading(false)
      })
  }, [])

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
                <p className="overview-label">Total Flights</p>
                <h3 className="overview-value">{loading ? '...' : stats.flights}</h3>
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

          <div className="form-section mt-4 mb-0">
            <h5 className="form-title text-center mb-3">Quick Summary</h5>

            <div className="row text-center">
              <div className="col-md-4 mb-3">
                <div className="summary-panel">
                  <p className="summary-panel-title">Employee Management</p>
                  <p className="summary-panel-text">
                    View employee records, register new employees, manage requests, and review payroll reports.
                  </p>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="summary-panel">
                  <p className="summary-panel-title">Flight Operations</p>
                  <p className="summary-panel-text">
                    Manage flights, create new routes and schedules, assign employees, and generate flight reports.
                  </p>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="summary-panel">
                  <p className="summary-panel-title">Transactions</p>
                  <p className="summary-panel-text">
                    Review transaction history and generate filtered transaction reports for airline activity.
                  </p>
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
