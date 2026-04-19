import React, { useState, useEffect } from 'react';
import "../components/ManagerStyles.css";

function EmployeeRegisterForm() {

    const [form, setForm] = useState({
        first_name: '',
        middle_initial: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        ssn: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        department_id: '',
        job_title_id: '',
        salary: '',
        start_date: '',
        supervisor_id: '',
        email: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [dropdowns, setDropdowns] = useState({
        departments: [],
        jobTitles: [],
        supervisors: []
    });



    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

                const res = await fetch(`${API_BASE_URL}/api/employees/dropdowns`);
                const data = await res.json();
                setDropdowns(data);
            } catch (err) {
                console.error(err);
                setError('Error loading dropdown options.');
            }
        }

        fetchDropdowns();
    }, []);

    const handleChange = (e) => {

        const { id, value } = e.target;
        let val = value;

        if (id === 'middle_initial' && val.length > 1) {
            val = val.charAt(0).toUpperCase();
        }

        setForm({ ...form, [id]: val });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const res = await fetch(`${API_BASE_URL}/api/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                throw new Error('Failed to register employee');
            }

            await res.json();

            setMessage("Employee registered successfully! Please use the temporary password to log in and change it immediately.");
            setError('');

        } catch (err) {

            console.error(err);
            setError("Error registering employee.");
            setMessage('');

        }

    };

    return (

        <div className="container-fluid form-wrapper">

            <div className="card signup-container shadow-sm border-danger">

                <div className="card-body">

                    <h2 className="form-title mb-3">Register New Employee</h2>
                    <p className="text-muted">
                        A temporary password will be assigned automatically when the employee account is created.
                    </p>

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

                    <form onSubmit={handleSubmit}>

                        <div className="form-section mb-4">

                            <h5 className="section-title">
                                Personal Information
                            </h5>

                            <div className="row">

                                <div className="col-md-4 mb-3 form-field">
                                    <label>First Name*</label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        className="form-control"
                                        value={form.first_name}
                                        placeholder='First Name'
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-4 mb-3 form-field">
                                    <label>Middle Initial</label>
                                    <input
                                        type="text"
                                        id="middle_initial"
                                        className="form-control"
                                        value={form.middle_initial}
                                        maxLength="1"
                                        onChange={handleChange}
                                        placeholder='Middle Initial'
                                    />
                                </div>

                                <div className="col-md-4 mb-3 form-field">
                                    <label>Last Name*</label>
                                    <input
                                        type="text"
                                        id="last_name"
                                        className="form-control"
                                        value={form.last_name}
                                        onChange={handleChange}
                                        placeholder='Last Name'
                                        required
                                    />
                                </div>

                            </div>

                            <div className="row">

                                <div className="col-md-4 mb-3 form-field">
                                    <label>Gender*</label>
                                    <select
                                        id="gender"
                                        className="form-control"
                                        value={form.gender}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                        <option value="X">Non-Binary</option>
                                        <option value="U">Other</option>
                                    </select>
                                </div>

                                <div className="col-md-4 mb-3 form-field">
                                    <label>Date of Birth*</label>
                                    <input
                                        type="date"
                                        id="date_of_birth"
                                        className="form-control"
                                        value={form.date_of_birth}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-4 mb-3 form-field">
                                    <label>SSN*</label>
                                    <input
                                        type="number"
                                        id="ssn"
                                        className="form-control"
                                        value={form.ssn}
                                        onChange={handleChange}
                                        placeholder='XXX-XX-XXXX'
                                        required
                                    />
                                </div>

                            </div>

                        </div>

                        <div className="form-section mb-4">

                            <h5 className="section-title">
                                Employee Information
                            </h5>

                            <div className="row">

                                <div className="col-md-3 mb-3 form-field">
                                    <label>Department*</label>
                                    <select
                                        id="department_id"
                                        className="form-control"
                                        value={form.department_id}
                                        onChange={handleChange}
                                        required
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
                                </div>

                                <div className="col-md-3 mb-3 form-field">
                                    <label>Job Title*</label>
                                    <select
                                        id="job_title_id"
                                        className="form-control"
                                        value={form.job_title_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Job Title</option>
                                        {dropdowns.jobTitles.map((job) => (
                                            <option
                                                key={job.job_title_id}
                                                value={job.job_title_id}
                                            >
                                                {job.title_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3 mb-3 form-field">
                                    <label>Salary*</label>
                                    <input
                                        type="number"
                                        id="salary"
                                        className="form-control"
                                        value={form.salary}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-3 mb-3 form-field">
                                    <label>Supervisor</label>
                                    <select
                                        id="supervisor_id"
                                        className="form-control"
                                        value={form.supervisor_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Supervisor</option>
                                        {dropdowns.supervisors.map((supervisor) => (
                                            <option
                                                key={supervisor.employee_id}
                                                value={supervisor.employee_id}
                                            >
                                                {supervisor.first_name} {supervisor.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="row">

                                <div className="col-md-4 mb-3 form-field">
                                    <label>Start Date*</label>
                                    <input
                                        type="date"
                                        id="start_date"
                                        className="form-control"
                                        value={form.start_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                            </div>

                        </div>

                        <div className="form-section mb-4">

                            <h5 className="section-title">
                                Emergency Contact Information
                            </h5>

                            <div className="row">
                                <div className="col-md-4 mb-3 form-field">
                                    <label>Emergency Contact Name</label>
                                    <input
                                        type="text"
                                        id="emergency_contact_name"
                                        className="form-control"
                                        value={form.emergency_contact_name}
                                        onChange={handleChange}
                                        placeholder='Contact Name'
                                    />
                                </div>

                                <div className="col-md-4 mb-3 form-field">
                                    <label>Emergency Contact Phone</label>
                                    <input
                                        type="text"
                                        id="emergency_contact_phone"
                                        className="form-control"
                                        value={form.emergency_contact_phone}
                                        onChange={handleChange}
                                        placeholder='Contact Phone'
                                    />
                                </div>

                                <div className="col-md-4 mb-3 form-field">
                                    <label>Emergency Contact Relationship</label>
                                    <input
                                        type="text"
                                        id="emergency_contact_relationship"
                                        className="form-control"
                                        value={form.emergency_contact_relationship}
                                        onChange={handleChange}
                                        placeholder='Contact Relationship'
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section mb-4">

                            <h5 className="section-title">
                                Account Information
                            </h5>

                            <div className="row">

                                <div className="col-md-6 mb-3 form-field">
                                    <label>Email*</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder='Email'
                                        required
                                    />
                                </div>

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="login-button"
                        >
                            Register Employee
                        </button>

                    </form>

                </div>

            </div>

        </div>

    );
}

export default EmployeeRegisterForm;
