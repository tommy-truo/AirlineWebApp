import { useState, useEffect } from 'react';
import '../components/styles.css';

function PayrollReports() {
    const [filters, setFilters] = useState({
        departmentId: '',
        jobTitleId: '',
        activeOnly: '',
        startDateFrom: '',
        startDateTo: ''
    })

    const [dropdowns, setDropdowns] = useState({
        departments: [],
        jobTitles: []
    })

    const [reportData, setReportData] = useState({
        reportMeta: null,
        summary: {
            totalEmployees: 0,
            activeCount: 0,
            inactiveCount: 0
        },
        formattedReport: [],
        rawData: []
    })

    const [hasGenerated, setHasGenerated] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        fetchDropdowns()
    }, [])

    async function fetchDropdowns() {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const res = await fetch(`${API_BASE_URL}/api/payroll/dropdowns`)

            if (!res.ok) {
                throw new Error()
            }

            const data = await res.json()

            setDropdowns({
                departments: data.departments || [],
                jobTitles: data.jobTitles || []
            })
        } catch (err) {
            console.log(err)
            setError("Error loading payroll report filter options.")
            setMessage('')
        }
    }

    function handleChange(e) {
        const { name, value } = e.target

        setFilters((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    async function handleGenerateReport(e) {
        e.preventDefault()

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const params = new URLSearchParams({
                departmentId: filters.departmentId,
                jobTitleId: filters.jobTitleId,
                activeOnly: filters.activeOnly,
                startDateFrom: filters.startDateFrom,
                startDateTo: filters.startDateTo
            })

            const res = await fetch(`${API_BASE_URL}/api/payroll/reports?${params.toString()}`)

            if (!res.ok) {
                throw new Error()
            }

            const data = await res.json()

            setReportData({
                reportMeta: data.reportMeta || null,
                summary: data.summary || {
                    totalEmployees: 0,
                    activeCount: 0,
                    inactiveCount: 0
                },
                formattedReport: data.formattedReport || [],
                rawData: data.rawData || []
            })
            setHasGenerated(true)
            setMessage("Report generated successfully.")
            setError('')
        } catch (err) {
            console.log(err)
            setError("Error generating payroll report.")
            setMessage('')
            setHasGenerated(false)
        }
    }

    return (
        <div className="container-fluid form-wrapper">

            <div className="card signup-container directory-card shadow-sm border-danger">
                <div className="card-body">

                    <h2 className="form-title mb-3">Employee Payroll Reports</h2>

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

                    <div className="form-section mb-4">
                        <h5 className="form-title text-center mb-3">Report Request</h5>

                        <form onSubmit={handleGenerateReport}>
                            <div className="row">
                                <div className="col-md-4 mb-3 form-field">
                                    <label>Department</label>
                                    <select
                                        name="departmentId"
                                        className="form-control"
                                        value={filters.departmentId}
                                        onChange={handleChange}
                                    >
                                        <option value="">All Departments</option>
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

                                <div className="col-md-4 mb-3 form-field">
                                    <label>Job Title</label>
                                    <select
                                        name="jobTitleId"
                                        className="form-control"
                                        value={filters.jobTitleId}
                                        onChange={handleChange}
                                    >
                                        <option value="">All Job Titles</option>
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

                                <div className="col-md-4 mb-3 form-field">
                                    <label>Employee Status</label>
                                    <select
                                        name="activeOnly"
                                        className="form-control"
                                        value={filters.activeOnly}
                                        onChange={handleChange}
                                    >
                                        <option value="">All</option>
                                        <option value="true">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3 form-field">
                                    <label>Start Date From</label>
                                    <input
                                        type="date"
                                        name="startDateFrom"
                                        className="form-control"
                                        value={filters.startDateFrom}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6 mb-3 form-field">
                                    <label>Start Date To</label>
                                    <input
                                        type="date"
                                        name="startDateTo"
                                        className="form-control"
                                        value={filters.startDateTo}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="login-button mt-2">
                                Generate Report
                            </button>
                        </form>
                    </div>

                    {hasGenerated && (
                        <>
                            <hr />

                            <div className="form-section my-4">
                                <h5 className="form-title text-center mb-3">Report Output</h5>

                                {reportData.reportMeta && (
                                    <div className="mb-3">
                                        <p className="mb-1">
                                            <strong>Report:</strong> {reportData.reportMeta.reportName}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Department:</strong> {reportData.reportMeta.departmentId || 'All'}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Job Title:</strong> {reportData.reportMeta.jobTitleId || 'All'}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Status:</strong> {
                                                reportData.reportMeta.activeOnly === 'true'
                                                    ? 'Active'
                                                    : reportData.reportMeta.activeOnly === 'inactive'
                                                        ? 'Inactive'
                                                        : 'All'
                                            }
                                        </p>
                                        <p className="mb-1">
                                            <strong>Start Date Range:</strong> {reportData.reportMeta.startDateFrom || 'Any'} to {reportData.reportMeta.startDateTo || 'Any'}
                                        </p>
                                    </div>
                                )}

                                <div style={{ overflowX: "auto" }}>
                                    <table className="table table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Total Employees</th>
                                                <th>Active Employees</th>
                                                <th>Inactive Employees</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr>
                                                <td>{reportData.summary.totalEmployees}</td>
                                                <td>{reportData.summary.activeCount}</td>
                                                <td>{reportData.summary.inactiveCount}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ overflowX: "auto" }}>
                                    <table className="table table-bordered mt-3">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Department</th>
                                                <th>Job Title</th>
                                                <th>Employee Count</th>
                                                <th>Total Salary</th>
                                                <th>Average Salary</th>
                                                <th>Min Salary</th>
                                                <th>Max Salary</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {reportData.formattedReport.length > 0 ? (
                                                reportData.formattedReport.map((row, index) => (
                                                    <tr key={index}>
                                                        <td>{row.department_name}</td>
                                                        <td>{row.job_title}</td>
                                                        <td>{row.employee_count}</td>
                                                        <td>${Number(row.total_salary || 0).toFixed(2)}</td>
                                                        <td>${Number(row.average_salary || 0).toFixed(2)}</td>
                                                        <td>${Number(row.min_salary || 0).toFixed(2)}</td>
                                                        <td>${Number(row.max_salary || 0).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center">
                                                        No report output found for the selected filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <hr />

                            <div className="form-section mt-4">
                                <h5 className="form-title text-center mb-3">Raw Data Used</h5>
                                <div style={{ overflowX: "auto" }}>
                                    <table className="table table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Employee ID</th>
                                                <th>Employee Name</th>
                                                <th>Department</th>
                                                <th>Job Title</th>
                                                <th>Salary</th>
                                                <th>Monthly Salary</th>
                                                <th>Start Date</th>
                                                <th>Years of Service</th>
                                                <th>Active</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {reportData.rawData.length > 0 ? (
                                                reportData.rawData.map((row) => (
                                                    <tr key={row.employee_id}>
                                                        <td>{row.employee_id}</td>
                                                        <td>{row.employee_name}</td>
                                                        <td>{row.department_name}</td>
                                                        <td>{row.job_title}</td>
                                                        <td>${Number(row.salary || 0).toFixed(2)}</td>
                                                        <td>${Number(row.monthly_salary || 0).toFixed(2)}</td>
                                                        <td>{row.start_date}</td>
                                                        <td>{row.years_of_service}</td>
                                                        <td>{Number(row.is_active) === 1 ? 'Yes' : 'No'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="9" className="text-center">
                                                        No raw data found for the selected filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>

        </div>
    )
}

export default PayrollReports;
