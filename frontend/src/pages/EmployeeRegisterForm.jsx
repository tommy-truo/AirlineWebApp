import React, { useState } from 'react';
import axios from 'axios';
import '../styles/styles.css';

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
        email: '',
        password: '',
        confirmPassword: ''
    });

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

        if (form.password !== form.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        // const { confirmPassword, ...dataToSend } = form;

        try {

            const res = await axios.post(
                'http://localhost:3000/api/employees',
                form
            );

            console.log(res);
            alert("Employee registered successfully!");

        } catch (err) {

            console.error(err);
            alert("Error registering employee.");

        }

    };

    return (

            <div className="container-fluid form-wrapper">

                {/* Form Card */}
                <div className="card signup-container shadow-sm border-danger">

                    <div className="card-body">

                        <h2 className="form-title mb-3">Register New Employee</h2>

                        <form onSubmit={handleSubmit}>

                            {/* PERSONAL INFO */}
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
                                            <option value="M">M</option>
                                            <option value="F">F</option>
                                            <option value="X">X</option>
                                            <option value="U">U</option>
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


                            {/* EMPLOYEE INFO */}
                            <div className="form-section mb-4">

                                <h5 className="section-title">
                                    Employee Information
                                </h5>

                                <div className="row">

                                    <div className="col-md-3 mb-3 form-field">
                                        <label>Department ID*</label>
                                        <input
                                            type="number"
                                            id="department_id"
                                            className="form-control"
                                            value={form.department_id}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-3 mb-3 form-field">
                                        <label>Job Title ID*</label>
                                        <input
                                            type="number"
                                            id="job_title_id"
                                            className="form-control"
                                            value={form.job_title_id}
                                            onChange={handleChange}
                                            required
                                        />
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
                                        <label>Supervisor ID</label>
                                        <input
                                            type="number"
                                            id="supervisor_id"
                                            className="form-control"
                                            value={form.supervisor_id}
                                            onChange={handleChange}
                                            required
                                        />
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

                            {/* {EMERGENCY CONTACT INFORMATION} */}
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

                            {/* ACCOUNT INFO */}
                            <div className="form-section mb-4">

                                <h5 className="section-title">
                                    Account Information
                                </h5>

                                <div className="row">

                                    <div className="col-md-4 mb-3 form-field">
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

                                    <div className="col-md-4 mb-3 form-field">
                                        <label>Password*</label>
                                        <input
                                            type="password"
                                            id="password"
                                            className="form-control"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder='Min 8 characters'
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3 form-field">
                                        <label>Confirm Password*</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            className="form-control"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            placeholder='Confirm Password'
                                            required
                                        />
                                    </div>

                                </div>

                            </div>


                            {/* SUBMIT */}
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
