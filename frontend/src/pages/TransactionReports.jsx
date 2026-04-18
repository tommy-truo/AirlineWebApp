import { useState, useEffect } from 'react';
import '../components/styles.css';

function TransactionReports() {

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    transactionTypeId: '',
    paymentMethodId: ''
  });

  const [dropdowns, setDropdowns] = useState({
    transactionTypes: [],
    paymentMethods: []
  });

  const [reportData, setReportData] = useState({
    reportMeta: null,
    formattedReport: [],
    rawData: []
  });

  const [hasGenerated, setHasGenerated] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDropdowns();
  }, []);

  async function fetchDropdowns() {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await fetch(`${API_BASE_URL}/api/transactions/dropdowns`);

      if (!res.ok) {
        throw new Error("Failed to load report filter options.");
      }

      const data = await res.json();

      setDropdowns({
        transactionTypes: data.transactionTypes || [],
        paymentMethods: data.paymentMethods || []
      });
    } catch (err) {
      console.log(err);
      setError("Error loading report filter options.");
      setMessage('');
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function handleGenerateReport(e) {
    e.preventDefault();

    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        transactionTypeId: filters.transactionTypeId,
        paymentMethodId: filters.paymentMethodId
      });

      const res = await fetch(`${API_BASE_URL}/api/transactions/reports?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Failed to generate transaction report.");
      }

      const data = await res.json();

      setReportData({
        reportMeta: data.reportMeta || null,
        formattedReport: data.formattedReport || [],
        rawData: data.rawData || []
      });
      setHasGenerated(true);
      setMessage("Report generated successfully.");
      setError('');
    } catch (err) {
      console.log(err);
      setError("Error generating transaction report.");
      setMessage('');
      setHasGenerated(false);
    }
  }

  const totalRevenue = reportData.rawData.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  const positiveRevenue = reportData.rawData
    .filter(row => Number(row.amount) > 0)
    .reduce((sum, row) => sum + Number(row.amount), 0);

  const refundedAmount = reportData.rawData
    .filter(row => Number(row.amount) < 0)
    .reduce((sum, row) => sum + Number(row.amount), 0);

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
                    <p><strong>Report:</strong> {reportData.reportMeta.reportName}</p>
                    <p><strong>Date Range:</strong> {reportData.reportMeta.startDate || 'Any'} to {reportData.reportMeta.endDate || 'Any'}</p>
                    <p><strong>Transaction Type:</strong> {reportData.reportMeta.transactionType || 'All'}</p>
                    <p><strong>Payment Method:</strong> {reportData.reportMeta.paymentMethod || 'All'}</p>
                  </div>
                )}

                <div style={{ overflowX: "auto" }}>
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Total Revenue</th>
                        <th>Total Sales</th>
                        <th>Total Refunded</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td>${totalRevenue.toFixed(2)}</td>
                        <td>${positiveRevenue.toFixed(2)}</td>
                        <td>${refundedAmount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="table table-bordered mt-3">
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
                            No report output found.
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
                            No raw data found.
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
  );
}

export default TransactionReports;
