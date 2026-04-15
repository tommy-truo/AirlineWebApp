import axios from "axios"
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom"
import '../styles/styles.css';

function EmployeeManagement() {

  const [data, setData] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editedEmployee, setEditedEmployee] = useState({})

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
        fetchEmployees()
      })
      .catch((err) => console.log(err))
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
        fetchEmployees()
      })
      .catch((err) => console.log(err))
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditedEmployee({})
  }

  return (
    <div className="container-fluid form-wrapper">

      <div className="card signup-container directory-card shadow-sm border-danger">

        <div className="card-body">

          <h2 className="form-title mb-3">Employee Directory</h2>

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
                {data.map((employee) => (
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
                          name="emergency_contact"
                          value={editedEmployee.emergency_contact}
                          onChange={handleFieldChange}
                          className="form-control form-control-sm"
                        />
                      ) : (
                        employee.emergency_contact
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
                            onClick={() => handleDelete(employee.employee_id)}
                          >
                            Delete
                          </button>
                        </>
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

export default EmployeeManagement
