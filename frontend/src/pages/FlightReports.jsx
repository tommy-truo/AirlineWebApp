import { useEffect, useState } from 'react'
import '../components/styles.css'

function FlightReports() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    statusId: '',
    departureAirportId: '',
    arrivalAirportId: ''
  })

  const [dropdowns, setDropdowns] = useState({
    statuses: [],
    airports: []
  })

  const [reportData, setReportData] = useState({
    reportMeta: null,
    summary: null,
    rawData: []
  })

  const [hasGenerated, setHasGenerated] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDropdowns()
  }, [])

  function formatDateTime(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString()
  }

  function fetchDropdowns() {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    fetch(`${API_BASE_URL}/api/flight-reports/dropdowns`)
      .then(res => res.json())
      .then(data => {
        setDropdowns({
          statuses: data.statuses || [],
          airports: data.airports || []
        })
      })
      .catch(() => {
        setError('Error loading report filter options.')
        setMessage('')
      })
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  function handleGenerateReport(e) {
    e.preventDefault()

    const queryParams = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      statusId: filters.statusId,
      departureAirportId: filters.departureAirportId,
      arrivalAirportId: filters.arrivalAirportId
    })

    fetch(`${API_BASE_URL}/api/flight-reports?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        setReportData({
          reportMeta: data.reportMeta || null,
          summary: data.summary || null,
          rawData: data.rawData || []
        })
        setHasGenerated(true)
        setMessage('Report generated successfully.')
        setError('')
      })
      .catch(() => {
        setError('Error generating flight report.')
        setMessage('')
        setHasGenerated(false)
      })
  }

  return (
    <div className="container-fluid form-wrapper">
      <div className="card signup-container directory-card shadow-sm border-danger">
        <div className="card-body">

          <h2 className="form-title mb-3">Flight Reports</h2>

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
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={filters.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4 mb-3 form-field">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={filters.endDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4 mb-3 form-field">
                  <label>Status</label>
                  <select
                    name="statusId"
                    className="form-control"
                    value={filters.statusId}
                    onChange={handleChange}
                  >
                    <option value="">All Statuses</option>
                    {dropdowns.statuses.map(status => (
                      <option
                        key={status.flight_status_id}
                        value={status.flight_status_id}
                      >
                        {status.status_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3 form-field">
                  <label>Departure Airport</label>
                  <select
                    name="departureAirportId"
                    className="form-control"
                    value={filters.departureAirportId}
                    onChange={handleChange}
                  >
                    <option value="">All Departure Airports</option>
                    {dropdowns.airports.map(airport => (
                      <option
                        key={airport.airport_id}
                        value={airport.airport_id}
                      >
                        {airport.iata} — {airport.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3 form-field">
                  <label>Arrival Airport</label>
                  <select
                    name="arrivalAirportId"
                    className="form-control"
                    value={filters.arrivalAirportId}
                    onChange={handleChange}
                  >
                    <option value="">All Arrival Airports</option>
                    {dropdowns.airports.map(airport => (
                      <option
                        key={airport.airport_id}
                        value={airport.airport_id}
                      >
                        {airport.iata} — {airport.city}
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
                    <p><strong>Status:</strong> {reportData.reportMeta.statusName || 'All'}</p>
                    <p><strong>Departure Airport:</strong> {reportData.reportMeta.departureAirport || 'All'}</p>
                    <p><strong>Arrival Airport:</strong> {reportData.reportMeta.arrivalAirport || 'All'}</p>
                  </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Total Flights</th>
                        <th>On Schedule</th>
                        <th>Delayed</th>
                        <th>Cancelled</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData.summary ? (
                        <tr>
                          <td>{reportData.summary.totalFlights}</td>
                          <td>{reportData.summary.onScheduleCount}</td>
                          <td>{reportData.summary.delayedCount}</td>
                          <td>{reportData.summary.cancelledCount}</td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">
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

                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Flight</th>
                        <th>Route</th>
                        <th>Aircraft</th>
                        <th>Status</th>
                        <th>Reason</th>
                        <th>Scheduled Departure</th>
                        <th>Scheduled Arrival</th>
                        <th>Actual Departure</th>
                        <th>Actual Arrival</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData.rawData.length > 0 ? (
                        reportData.rawData.map(row => (
                          <tr key={row.flight_instance_id}>
                            <td>{row.flight_number}</td>
                            <td>{row.departure_city} → {row.arrival_city}</td>
                            <td>{row.aircraft_name}</td>
                            <td>
                              <span className={`status-badge ${getFlightStatusClass(row.status_name)}`}>
                                {row.status_name}
                              </span>
                            </td>                            <td>{row.reason_name || '—'}</td>
                            <td>{formatDateTime(row.scheduled_departure_datetime)}</td>
                            <td>{formatDateTime(row.scheduled_arrival_datetime)}</td>
                            <td>{formatDateTime(row.actual_departure_datetime)}</td>
                            <td>{formatDateTime(row.actual_arrival_datetime)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center">
                            No report data found.
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

export default FlightReports
