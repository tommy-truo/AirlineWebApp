import axios from "axios"
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom"
import '../styles/styles.css';

function EmployeeManagement() {

  const [data, setData] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editedEmployee, setEditedEmployee] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const employeesPerPage = 8

  useEffect(() => {
    fetchEmployees()
  }, [])

  function fetchEmployees() {
    axios.get("http://localhost:3000/api/employees")
      .then((res) => {
        setData(res.data)
      })
      .catch((err) => console.log(err))
  }

  function handleDelete(id) {
    axios.delete(`http://localhost:3000/api/employees/${id}`)
      .then(() => {
        setMessage("Employee deactivated successfully.");
        setError('');
        setConfirmId(null);
        fetchEmployees();
      })
      .catch((err) => {
        console.log(err);
        setError("Error deactivating employee.");
        setMessage('');
      });
  }

  function handleEditClick(employee) {
    setEditingId(employee.employee_id)
    setEditedEmployee({ ...employee })
  }

  function handleFieldChange(e) {
    const { name, value } = e.target
    setEditedEmployee((prev) => ({ ...prev, [name]: value }))
  }

  function handleSaveEdit(id) {
    axios.put(`http://localhost:3000/api/employees/${id}`, editedEmployee)
      .then(() => {
        setEditingId(null)
        setEditedEmployee({})
        setMessage("Employee updated successfully.");
        setError('');
        fetchEmployees();
      })
      .catch((err) => {
        console.log(err);
        setError("Error updating employee.");
        setMessage('');
      })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditedEmployee({})
  }

  const indexOfLastEmployee = currentPage * employeesPerPage
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage
  const currentEmployees = data.slice(indexOfFirstEmployee, indexOfLastEmployee)
  const totalPages = Math.ceil(data.length / employeesPerPage)

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

          <h2 className="form-title mb-3">Employee Directory</h2>

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="d-flex justify-content-end mb-3">
            <Link className="btn btn-success" to="/employee-register">
              Register Employee
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table table-bordered">

              <thead className="table-light">
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Salary</th>
                  <th>Supervisor ID</th>
                  <th>Emergency Contact</th>
                  <th>Emergency Contact Phone</th>
                  <th>Emergency Contact Relationship</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentEmployees.map((employee) => (
                  <tr key={employee.employee_id}>

                    <td>{employee.employee_id}</td>

                    <td className="text-nowrap">
                      {employee.first_name} {employee.last_name}
                    </td>

                    <td>
                      {editingId === employee.employee_id ? (
                        <input
                          type="number"
                          name="department_id"
                          value={editedEmployee.department_id}
                          onChange={handleFieldChange}
                          className="form-control form-control-sm"
                        />
                      ) : (
                        employee.department_id
                      )}
                    </td>

                    <td>
                      {editingId === employee.employee_id ? (
                        <input
                          type="number"
                          name="job_title_id"
                          value={editedEmployee.job_title_id}
                          onChange={handleFieldChange}
                          className="form-control form-control-sm"
                        />
                      ) : (
                        employee.job_title_id
                      )}
                    </td>

                    <td>
                      {editingId === employee.employee_id ? (
                        <input
                          type="number"
                          name="salary"
                          value={editedEmployee.salary}
                          onChange={handleFieldChange}
                          className="form-control form-control-sm"
                        />
                      ) : (
                        `$${employee.salary}`
                      )}
                    </td>

                    <td>
                      {editingId === employee.employee_id ? (
                        <input
                          type="number"
                          name="supervisor_id"
                          value={editedEmployee.supervisor_id}
                          onChange={handleFieldChange}
                          className="form-control form-control-sm"
                        />
                      ) : (
                        employee.supervisor_id
                      )}
                    </td>

                    <td>
                      {editingId === employee.employee_id ? (
                        <input
                          type="text"
                          name="emergency_contact_name"
                          value={editedEmployee.emergency_contact_name}
                          onChange={handleFieldChange}
                          className="form-control form-control-sm"
                        />
                      ) : (
                        employee.emergency_contact_name
                      )}
                    </td>

                    <td>
                      {editingId === employee.employee_id ? (
                        <input
                          type="text"
                          name="emergency_contact_phone"
                          value={editedEmployee.emergency_contact_phone}
                          onChange={handleFieldChange}
                          className="form-control form-control-sm"
                        />
                      ) : (
                        employee.emergency_contact_phone
                      )}
                    </td>

                    <td>
                      {editingId === employee.employee_id ? (
                        <input
                          type="text"
                          name="emergency_contact_relationship"
                          value={editedEmployee.emergency_contact_relationship}
                          onChange={handleFieldChange}
                          className="form-control form-control-sm"
                        />
                      ) : (
                        employee.emergency_contact_relationship
                      )}
                    </td>

                    <td>
                      {editingId === employee.employee_id ? (
                        <>
                          <button
                            className="btn btn-success mx-1"
                            onClick={() => handleSaveEdit(employee.employee_id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-secondary mx-1"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-primary mx-1"
                            onClick={() => handleEditClick(employee)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger mx-1"
                            onClick={() => setConfirmId(employee.employee_id)}
                          >
                            Deactivate
                          </button>

                          {confirmId === employee.employee_id && (
                            <div className="mt-2">
                              <span className="text-danger me-2">Confirm?</span>
                              <button
                                className="btn btn-sm btn-danger me-1"
                                onClick={() => handleDelete(employee.employee_id)}
                              >
                                Yes
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setConfirmId(null)}
                              >
                                No
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
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
              className="btn btn-outline-danger"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}

export default EmployeeManagement
