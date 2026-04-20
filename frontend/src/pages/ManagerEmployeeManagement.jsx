import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import "../components/ManagerStyles.css";

function EmployeeManagement() {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdowns, setDropdowns] = useState({
    departments: [],
    jobTitles: [],
    supervisors: []
  });

  const employeesPerPage = 8;

  useEffect(() => {
    fetchEmployees();
    fetchDropdowns();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  async function fetchEmployees() {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await fetch(`${API_BASE_URL}/api/employees`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.log(err);
      setError("Error loading employees.");
    }
  }

  async function fetchDropdowns() {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await fetch(`${API_BASE_URL}/api/employees/dropdowns`);
      const result = await res.json();
      setDropdowns(result);
    } catch (err) {
      console.log(err);
      setError("Error loading dropdown options.");
    }
  }

  async function handleDelete(id) {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Failed to deactivate employee");
      }

      setMessage("Employee deactivated successfully.");
      setError('');
      setConfirmId(null);
      fetchEmployees();
    } catch (err) {
      console.log(err);
      setError("Error deactivating employee.");
      setMessage('');
    }
  }

  function handleEditClick(employee) {
    setEditingId(employee.employee_id);
    setEditedEmployee({
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      department_id: employee.department_id || '',
      job_title_id: employee.job_title_id || '',
      salary: employee.salary || '',
      supervisor_id: employee.supervisor_id || '',
      emergency_contact_name: employee.emergency_contact_name || '',
      emergency_contact_phone: employee.emergency_contact_phone || '',
      emergency_contact_relationship: employee.emergency_contact_relationship || ''
    });
  }

  function handleFieldChange(e) {
    const { name, value } = e.target;

    setEditedEmployee((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'department_id') {
        updated.job_title_id = '';
      }

      return updated;
    });
  }

  async function handleSaveEdit(id) {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editedEmployee)
      });

      if (!res.ok) {
        throw new Error("Failed to update employee");
      }

      setEditingId(null);
      setEditedEmployee({});
      setMessage("Employee updated successfully.");
      setError('');
      fetchEmployees();
    } catch (err) {
      console.log(err);
      setError("Error updating employee.");
      setMessage('');
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditedEmployee({});
  }

  const filteredEmployees = data.filter((employee) => {
    const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.toLowerCase();
    const matchesSearch =
      String(employee.employee_id || '').includes(searchTerm) ||
      fullName.includes(searchTerm.toLowerCase()) ||
      (employee.department_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.title_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.supervisor_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && Number(employee.is_active) === 1) ||
      (statusFilter === 'INACTIVE' && Number(employee.is_active) === 0);

    return matchesSearch && matchesFilter;
  });

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  function handleNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  function handlePrevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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

          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex gap-2 flex-wrap">
              <input
                type="text"
                className="form-control"
                placeholder="Search by ID, name, department, role, or supervisor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: "280px" }}
              />

              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ minWidth: "220px" }}
              >
                <option value="ALL">All Employees</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

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
                  <th>Status</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Salary</th>
                  <th>Supervisor</th>
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
                      {editingId === employee.employee_id ? (
                        <div className="d-flex gap-2">
                          <input
                            type="text"
                            name="first_name"
                            value={editedEmployee.first_name}
                            onChange={handleFieldChange}
                            className="form-control form-control-sm"
                            placeholder="First Name"
                          />
                          <input
                            type="text"
                            name="last_name"
                            value={editedEmployee.last_name}
                            onChange={handleFieldChange}
                            className="form-control form-control-sm"
                            placeholder="Last Name"
                          />
                        </div>
                      ) : (
                        `${employee.first_name} ${employee.last_name}`
                      )}
                    </td>

                    <td>
                      <span className={`status-badge ${Number(employee.is_active) === 1 ? 'status-active' : 'status-inactive'
                        }`}>
                        {Number(employee.is_active) === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td>
                      {editingId === employee.employee_id ? (
                        <select
                          name="department_id"
                          value={editedEmployee.department_id}
                          onChange={handleFieldChange}
                          className="form-control form-control-sm"
                        >
                          <option value="">Select Department</option>
                          {dropdowns.departments.map((department) => (
                            <option
                              key={department.department_id}
                              value={department.department_id}
                            >
                              {department.department_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        employee.department_name || "N/A"
                      )}
                    </td>

                    <td>
                      {editingId === employee.employee_id ? (
                        <select
                          name="job_title_id"
                          value={editedEmployee.job_title_id}
                          onChange={handleFieldChange}
                          className="form-control form-control-sm"
                          disabled={!editedEmployee.department_id}
                        >
                          <option value="">
                            {editedEmployee.department_id ? 'Select Job Title' : 'Select Department First'}
                          </option>
                          {dropdowns.jobTitles
                            .filter(
                              (job) =>
                                String(job.department_id) === String(editedEmployee.department_id)
                            )
                            .map((job) => (
                              <option
                                key={job.job_title_id}
                                value={job.job_title_id}
                              >
                                {job.title_name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        employee.title_name || "N/A"
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
                        <select
                          name="supervisor_id"
                          value={editedEmployee.supervisor_id}
                          onChange={handleFieldChange}
                          className="form-control form-control-sm"
                        >
                          <option value="">No Supervisor</option>
                          {dropdowns.supervisors
                            .filter((supervisor) => supervisor.employee_id !== employee.employee_id)
                            .map((supervisor) => (
                              <option
                                key={supervisor.employee_id}
                                value={supervisor.employee_id}
                              >
                                {supervisor.first_name} {supervisor.last_name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        employee.supervisor_name || "N/A"
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
                        employee.emergency_contact_name || "N/A"
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
                        employee.emergency_contact_phone || "N/A"
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
                        employee.emergency_contact_relationship || "N/A"
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
  );
}

export default EmployeeManagement;
