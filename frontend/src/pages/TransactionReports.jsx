
import axios from "axios"
import { useState, useEffect } from 'react';
import '../styles/styles.css';

function TransactionReports() {

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    transactionTypeId: '',
    paymentMethodId: ''
  })

  const [dropdowns, setDropdowns] = useState({
    transactionTypes: [],
    paymentMethods: []
  })

  const [reportData, setReportData] = useState({
    reportMeta: null,
    formattedReport: [],
    rawData: []
  })

  const [hasGenerated, setHasGenerated] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDropdowns()
  }, [])

  function fetchDropdowns() {
    axios.get("http://localhost:3000/api/transactions/dropdowns")
      .then((res) => {
        setDropdowns({
          transactionTypes: res.data.transactionTypes || [],
          paymentMethods: res.data.paymentMethods || []
        })
      })
      .catch((err) => {
        console.log(err)
        setError("Error loading report filter options.")
        setMessage('')
      })
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  function handleGenerateReport(e) {
    e.preventDefault()

    axios.get("http://localhost:3000/api/transactions/reports", {
      params: {
        startDate: filters.startDate,
        endDate: filters.endDate,
        transactionTypeId: filters.transactionTypeId,
        paymentMethodId: filters.paymentMethodId
      }
    })
      .then((res) => {
        setReportData({
          reportMeta: res.data.reportMeta || null,
          formattedReport: res.data.formattedReport || [],
          rawData: res.data.rawData || []
        })
        setHasGenerated(true)
        setMessage("Report generated successfully.")
        setError('')
      })
      .catch((err) => {
        console.log(err)
        setError("Error generating transaction report.")
        setMessage('')
        setHasGenerated(false)
      })
  }

  return (
    <div className="container-fluid form-wrapper">

      <div className="card signup-container directory-card shadow-sm border-danger">
        <div className="card-body">

          <h2 className="form-title mb-3">Transaction Reports</h2>

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
                <div className="col-md-3 mb-3 form-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={filters.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3 mb-3 form-field">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={filters.endDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3 mb-3 form-field">
                  <label>Transaction Type</label>
                  <select
                    name="transactionTypeId"
                    className="form-control"
                    value={filters.transactionTypeId}
                    onChange={handleChange}
                  >
                    <option value="">All Transaction Types</option>
                    {dropdowns.transactionTypes.map((type) => (
                      <option
                        key={type.transaction_type_id}
                        value={type.transaction_type_id}
                      >
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 mb-3 form-field">
                  <label>Payment Method</label>
                  <select
                    name="paymentMethodId"
                    className="form-control"
                    value={filters.paymentMethodId}
                    onChange={handleChange}
                  >
                    <option value="">All Payment Methods</option>
                    {dropdowns.paymentMethods.map((method) => (
                      <option
                        key={method.transaction_payment_method_id}
                        value={method.transaction_payment_method_id}
                      >
                        {method.payment_method_name}
                      </option>
                    ))}
                  </select>
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
                      <strong>Date Range:</strong> {reportData.reportMeta.startDate || 'Any'} to {reportData.reportMeta.endDate || 'Any'}
                    </p>
                    <p className="mb-1">
                      <strong>Transaction Type:</strong> {reportData.reportMeta.transactionType || 'All'}
                    </p>
                    <p className="mb-1">
                      <strong>Payment Method:</strong> {reportData.reportMeta.paymentMethod || 'All'}
                    </p>
                  </div>
                )}

                <div style={{ overflowX: "auto" }}>
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Transaction Type</th>
                        <th>Transaction Count</th>
                        <th>Total Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData.formattedReport.length > 0 ? (
                        reportData.formattedReport.map((row, index) => (
                          <tr key={index}>
                            <td>{row.transaction_type}</td>
                            <td>{row.transaction_count}</td>
                            <td>${Number(row.total_amount || 0).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center">
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
                        <th>Transaction ID</th>
                        <th>Booking ID</th>
                        <th>Amount</th>
                        <th>Date / Time</th>
                        <th>Transaction Type</th>
                        <th>Payment Method</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData.rawData.length > 0 ? (
                        reportData.rawData.map((row) => (
                          <tr key={row.transaction_id}>
                            <td>{row.transaction_id}</td>
                            <td>{row.booking_id}</td>
                            <td>${Number(row.amount || 0).toFixed(2)}</td>
                            <td>{row.transaction_datetime}</td>
                            <td>{row.transaction_type}</td>
                            <td>{row.payment_method}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">
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

export default TransactionReports
