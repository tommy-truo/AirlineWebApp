import { useEffect, useState } from 'react'
import "../components/ManagerStyles.css";

function EmployeeAssignments() {
  const [assignments, setAssignments] = useState([])
  const [employees, setEmployees] = useState([])
  const [flights, setFlights] = useState([])
  const [roles, setRoles] = useState([])

  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [form, setForm] = useState({
    employee_id: '',
    flight_instance_id: '',
    assignment_type_id: ''
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const assignmentsPerPage = 8

  useEffect(() => {
    fetchAssignments()
    fetchDropdowns()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterRole])

  function formatDateTime(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString()
  }

  function fetchAssignments() {
    fetch(`${API_BASE_URL}/api/assignments`)
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(() => setError('Error loading assignments.'))
  }

  function fetchDropdowns() {
    fetch(`${API_BASE_URL}/api/employees`)
      .then(res => res.json())
      .then(data => setEmployees(data))

    fetch(`${API_BASE_URL}/api/flights/all`)
      .then(res => res.json())
      .then(data => setFlights(data))

    fetch(`${API_BASE_URL}/api/assignments/types`)
      .then(res => res.json())
      .then(data => setRoles(data))
  }

  function handleChange(e) {
    const { id, value } = e.target
    setForm(prev => ({ ...prev, [id]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    fetch(`${API_BASE_URL}/api/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then((data) => {
        if (data.message) {
          if (
            data.message.includes('assigned') ||
            data.message.includes('conflict') ||
            data.message.includes('Only') ||
            data.message.includes('required') ||
            data.message.includes('Invalid')
          ) {
            setError(data.message)
            setMessage('')
            return
          }
        }

        setMessage('Assignment created successfully.')
        setError('')
        setForm({
          employee_id: '',
          flight_instance_id: '',
          assignment_type_id: ''
        })
        setCurrentPage(1)
        fetchAssignments()
      })
      .catch(() => {
        setError('Error creating assignment.')
        setMessage('')
      })
  }

  function handleDelete(id) {
    fetch(`${API_BASE_URL}/api/assignments/${id}`, {
      method: 'DELETE'
    }).then(() => {
      fetchAssignments()
      setCurrentPage(1)
    })
  }

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch =
      a.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      a.flight_number.toLowerCase().includes(search.toLowerCase())

    const matchesRole =
      filterRole === '' || a.type_name === filterRole

    return matchesSearch && matchesRole
  })

  const indexOfLastAssignment = currentPage * assignmentsPerPage
  const indexOfFirstAssignment = indexOfLastAssignment - assignmentsPerPage
  const currentAssignments = filteredAssignments.slice(indexOfFirstAssignment, indexOfLastAssignment)
  const totalPages = Math.ceil(filteredAssignments.length / assignmentsPerPage)

  function handleNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  function handlePrevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="container-fluid form-wrapper">
      <div className="card signup-container directory-card shadow-sm border-danger">
        <div className="card-body">

          <h2 className="form-title mb-3">Employee Assignments</h2>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>

            <div className="form-section mb-4">
              <h5 className="form-title text-center mb-3">Assignment Request</h5>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label>Employee</label>
                  <select id="employee_id" className="form-control" value={form.employee_id} onChange={handleChange}>
                    <option value="">Select Employee</option>
                    {employees.map(e => (
                      <option key={e.employee_id} value={e.employee_id}>
                        {e.first_name} {e.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label>Flight</label>
                  <select id="flight_instance_id" className="form-control" value={form.flight_instance_id} onChange={handleChange}>
                    <option value="">Select Flight</option>
                    {flights
                      .filter(f => new Date(f.scheduled_departure_datetime) > new Date())
                      .map(f => (
                        <option key={f.flight_instance_id} value={f.flight_instance_id}>
                          {f.flight_number} — {f.departure_city} → {f.arrival_city} — {formatDateTime(f.scheduled_departure_datetime)}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label>Assignment Type</label>
                  <select id="assignment_type_id" className="form-control" value={form.assignment_type_id} onChange={handleChange}>
                    <option value="">Select Assignment Type</option>
                    {roles.map(r => (
                      <option key={r.assignment_type_id} value={r.assignment_type_id}>
                        {r.type_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="login-button mt-2"
                disabled={!form.employee_id || !form.flight_instance_id || !form.assignment_type_id}
              >
                Assign Employee
              </button>
            </div>

            <hr />

            <div className="form-section mt-4">

              <div className="d-flex justify-content-between mb-3">
                <input
                  type="text"
                  placeholder="Search by employee or flight..."
                  className="form-control w-50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <select
                  className="form-control w-25"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  {roles.map(r => (
                    <option key={r.assignment_type_id}>
                      {r.type_name}
                    </option>
                  ))}
                </select>
              </div>

              <h5 className="text-center mb-2">
                Total Assignments: {filteredAssignments.length}
              </h5>

              <div style={{ overflowX: 'auto' }}>
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Employee</th>
                      <th>Job Title</th>
                      <th>Assignment Type</th>
                      <th>Flight</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Departure</th>
                      <th>Arrival</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentAssignments.length > 0 ? (
                      currentAssignments.map(a => (
                        <tr key={a.assignment_id}>
                          <td>{a.employee_name}</td>
                          <td>{a.title_name || '-'}</td>
                          <td>{a.type_name}</td>
                          <td>{a.flight_number}</td>
                          <td>{a.departure_city}</td>
                          <td>{a.arrival_city}</td>
                          <td>{formatDateTime(a.scheduled_departure_datetime)}</td>
                          <td>{formatDateTime(a.scheduled_arrival_datetime)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(a.assignment_id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center">
                          No assignments found.
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <span className="fw-semibold">
                  Page {currentPage} of {totalPages || 1}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  )
}

export default EmployeeAssignments
