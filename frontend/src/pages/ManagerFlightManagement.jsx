import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import "../components/ManagerStyles.css";

function FlightManagement() {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editedFlight, setEditedFlight] = useState({});
  const [dropdowns, setDropdowns] = useState({
    reasons: [],
    aircrafts: [],
    gates: []
  });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const flightsPerPage = 8;

  useEffect(() => {
    fetchFlights();
    fetchDropdowns();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  async function fetchFlights() {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE_URL}/api/flights/all`);

      if (!res.ok) {
        throw new Error("Failed to fetch flights");
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.log(err);
      setError("Error fetching flights.");
      setMessage('');
    }
  }

  async function fetchDropdowns() {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE_URL}/api/flights/dropdowns`);

      if (!res.ok) {
        throw new Error("Failed to fetch flight dropdown data");
      }

      const result = await res.json();

      setDropdowns({
        reasons: result.reasons || [],
        aircrafts: result.aircrafts || [],
        gates: result.gates || []
      });
    } catch (err) {
      console.log(err);
      setError("Error fetching flight dropdown data.");
      setMessage('');
    }
  }

  function isLockedFlight(flight) {
    return [4, 5, 6, 7].includes(Number(flight.status_id));
  }

  function formatDateTime(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  }

  function getFlightStatusClass(status) {
    switch (status) {
      case 'On Schedule':
        return 'status-green';
      case 'Boarding':
        return 'status-blue';
      case 'Delayed':
        return 'status-yellow';
      case 'Departed':
        return 'status-purple';
      case 'En Route':
        return 'status-cyan';
      case 'Arrived':
        return 'status-dark-green';
      case 'Cancelled':
        return 'status-red';
      default:
        return 'status-default';
    }
  }

  function getActionFromStatusId(statusId) {
    if (Number(statusId) === 3) return 'delay';
    if (Number(statusId) === 4) return 'cancel';
    return '';
  }

  function getDefaultReasonIdForNoIssue() {
    const noIssueReason = dropdowns.reasons.find(
      (reason) => Number(reason.flight_irregularity_reason_id) === 6
    );

    return noIssueReason ? String(noIssueReason.flight_irregularity_reason_id) : '6';
  }

  function shouldRequireReason(action) {
    return action === 'delay' || action === 'cancel';
  }

  function handleEditClick(flight) {
    setEditingId(flight.flight_instance_id);
    setExpandedId(flight.flight_instance_id);
    setEditedFlight({
      flight_instance_id: flight.flight_instance_id,
      aircraft_id: flight.aircraft_id || '',
      departure_gate_id: flight.departure_gate_id || '',
      arrival_gate_id: flight.arrival_gate_id || '',
      manager_action: getActionFromStatusId(flight.status_id),
      status_reason_id: flight.status_reason_id
        ? String(flight.status_reason_id)
        : getDefaultReasonIdForNoIssue(),
      scheduled_departure_datetime: flight.scheduled_departure_datetime
        ? new Date(flight.scheduled_departure_datetime).toISOString().slice(0, 16)
        : '',
      scheduled_arrival_datetime: flight.scheduled_arrival_datetime || ''
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditedFlight({});
  }

  function toggleExpanded(flightId) {
    setExpandedId((prev) => (prev === flightId ? null : flightId));
  }

  function handleFieldChange(e) {
    const { name, value } = e.target;

    setEditedFlight((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'manager_action' && !shouldRequireReason(value)) {
        updated.status_reason_id = getDefaultReasonIdForNoIssue();
      }

      return updated;
    });
  }

  async function handleSaveEdit(id) {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const currentFlight = data.find((flight) => flight.flight_instance_id === id);

      if (!currentFlight) {
        throw new Error("Flight not found.");
      }

      if (!editedFlight.aircraft_id || !editedFlight.departure_gate_id || !editedFlight.arrival_gate_id) {
        throw new Error("Aircraft and both gates are required.");
      }

      if (String(editedFlight.departure_gate_id) === String(editedFlight.arrival_gate_id)) {
        throw new Error("Departure and arrival gates cannot be the same.");
      }

      if (shouldRequireReason(editedFlight.manager_action) && !editedFlight.status_reason_id) {
        throw new Error("Please select a reason for this action.");
      }

      let finalStatusId = currentFlight.status_id;
      let finalReasonId = getDefaultReasonIdForNoIssue();
      let finalScheduledDeparture = '';
      let finalScheduledArrival = '';

      if (editedFlight.manager_action === 'delay') {
        finalStatusId = 3;
        finalReasonId = editedFlight.status_reason_id;

        if (!editedFlight.scheduled_departure_datetime) {
          throw new Error("Please enter a new scheduled departure time for a delayed flight.");
        }

        if (new Date(editedFlight.scheduled_departure_datetime) <= new Date()) {
          throw new Error("Delayed departure time must be in the future.");
        }

        const originalDeparture = new Date(currentFlight.scheduled_departure_datetime).getTime();
        const originalArrival = new Date(currentFlight.scheduled_arrival_datetime).getTime();
        const durationMs = originalArrival - originalDeparture;

        finalScheduledDeparture = editedFlight.scheduled_departure_datetime;
        finalScheduledArrival = new Date(
          new Date(editedFlight.scheduled_departure_datetime).getTime() + durationMs
        );
      } else if (editedFlight.manager_action === 'cancel') {
        finalStatusId = 4;
        finalReasonId = editedFlight.status_reason_id;
      } else {
        finalStatusId = currentFlight.status_id;
        finalReasonId = getDefaultReasonIdForNoIssue();
      }

      const payload = {
        aircraft_id: editedFlight.aircraft_id,
        departure_gate_id: editedFlight.departure_gate_id,
        arrival_gate_id: editedFlight.arrival_gate_id,
        status_id: finalStatusId,
        status_reason_id: finalReasonId,
        scheduled_departure_datetime: finalScheduledDeparture,
        scheduled_arrival_datetime: finalScheduledArrival
      };

      const res = await fetch(`${API_BASE_URL}/api/flights/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update flight");
      }

      setEditingId(null);
      setEditedFlight({});
      setMessage("Flight updated successfully.");
      setError('');
      fetchFlights();
    } catch (err) {
      console.log(err);
      setError(err.message || "Error updating flight.");
      setMessage('');
    }
  }

  const filteredFlights = data.filter((flight) => {
    const matchesSearch =
      flight.flight_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.departure_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.arrival_city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && [1, 2, 3, 5, 6].includes(Number(flight.status_id))) ||
      (statusFilter === 'ATTENTION' && [1, 2, 3].includes(Number(flight.status_id))) ||
      Number(flight.status_id) === Number(statusFilter);

    return matchesSearch && matchesFilter;
  });

  const indexOfLastFlight = currentPage * flightsPerPage;
  const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
  const currentFlights = filteredFlights.slice(indexOfFirstFlight, indexOfLastFlight);
  const totalPages = Math.ceil(filteredFlights.length / flightsPerPage);

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
          <h2 className="form-title mb-3">Flight Management</h2>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex gap-2 flex-wrap">
              <input
                type="text"
                className="form-control"
                placeholder="Search by flight # or city"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: "240px" }}
              />

              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ minWidth: "220px" }}
              >
                <option value="ALL">All Flights</option>
                <option value="ATTENTION">Needs Attention</option>
                <option value="ACTIVE">Active Flights</option>
                <option value="1">On Schedule</option>
                <option value="2">Boarding</option>
                <option value="3">Delayed</option>
                <option value="5">Departed</option>
                <option value="6">En Route</option>
                <option value="7">Arrived</option>
                <option value="4">Cancelled</option>
              </select>
            </div>

            <Link className="btn btn-success" to="/create-flight">
              Create Flight
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Flight #</th>
                  <th>Route</th>
                  <th>Aircraft</th>
                  <th>Status</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Schedule</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentFlights.length > 0 ? (
                  currentFlights.map((flight) => {
                    const lockedFlight = isLockedFlight(flight);
                    const editingThisRow = editingId === flight.flight_instance_id;
                    const showDetails = expandedId === flight.flight_instance_id || editingThisRow;

                    return (
                      <FragmentRow
                        key={flight.flight_instance_id}
                        flight={flight}
                        lockedFlight={lockedFlight}
                        editingThisRow={editingThisRow}
                        showDetails={showDetails}
                        editedFlight={editedFlight}
                        dropdowns={dropdowns}
                        formatDateTime={formatDateTime}
                        getFlightStatusClass={getFlightStatusClass}
                        handleFieldChange={handleFieldChange}
                        handleEditClick={handleEditClick}
                        handleSaveEdit={handleSaveEdit}
                        handleCancelEdit={handleCancelEdit}
                        toggleExpanded={toggleExpanded}
                      />
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No flights found.
                    </td>
                  </tr>
                )}
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

function FragmentRow({
  flight,
  lockedFlight,
  editingThisRow,
  showDetails,
  editedFlight,
  dropdowns,
  formatDateTime,
  getFlightStatusClass,
  handleFieldChange,
  handleEditClick,
  handleSaveEdit,
  handleCancelEdit,
  toggleExpanded
}) {
  const selectedAction = editingThisRow ? editedFlight.manager_action : '';
  const showReasonSelect = selectedAction === 'delay' || selectedAction === 'cancel';
  const showDelaySchedule = selectedAction === 'delay';

  return (
    <>
      <tr>
        <td className="fw-semibold">{flight.flight_number}</td>

        <td className="text-nowrap">
          {flight.departure_city} → {flight.arrival_city}
        </td>

        <td>{flight.aircraft_name || `Aircraft ${flight.aircraft_id}`}</td>

        <td>
          <span className={`status-badge ${getFlightStatusClass(flight.status_name)}`}>
            {flight.status_name}
          </span>
        </td>

        <td className="text-nowrap">
          <div>{flight.departure_terminal}</div>
          <div>Gate {flight.departure_gate_number}</div>
        </td>

        <td className="text-nowrap">
          <div>{flight.arrival_terminal}</div>
          <div>Gate {flight.arrival_gate_number}</div>
        </td>

        <td className="text-nowrap">
          <div><strong>Dep:</strong> {formatDateTime(flight.scheduled_departure_datetime)}</div>
          <div><strong>Arr:</strong> {formatDateTime(flight.scheduled_arrival_datetime)}</div>
        </td>

        <td>
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => toggleExpanded(flight.flight_instance_id)}
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>

            {editingThisRow ? (
              <>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleSaveEdit(flight.flight_instance_id)}
                >
                  Save
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </>
            ) : lockedFlight ? (
              <span className="text-muted fw-semibold align-self-center">Locked</span>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleEditClick(flight)}
              >
                Edit
              </button>
            )}
          </div>
        </td>
      </tr>

      {showDetails && (
        <tr>
          <td colSpan="8" className="bg-light">
            <div className="p-3">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <strong>Reason</strong>
                  {editingThisRow ? (
                    showReasonSelect ? (
                      <select
                        name="status_reason_id"
                        value={editedFlight.status_reason_id}
                        onChange={handleFieldChange}
                        className="form-control form-control-sm mt-2"
                      >
                        <option value="">Select Reason</option>
                        {dropdowns.reasons
                          .filter((reason) => Number(reason.flight_irregularity_reason_id) !== 6)
                          .map((reason) => (
                            <option
                              key={reason.flight_irregularity_reason_id}
                              value={reason.flight_irregularity_reason_id}
                            >
                              {reason.reason_name}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="mt-1 text-muted">Not needed</div>
                    )
                  ) : (
                    <div className="mt-1">{flight.reason_name || '-'}</div>
                  )}
                </div>

                <div className="col-md-4 mb-3">
                  <strong>Actual Departure</strong>
                  <div className="mt-1">
                    {formatDateTime(flight.actual_departure_datetime) || '-'}
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <strong>Actual Arrival</strong>
                  <div className="mt-1">
                    {formatDateTime(flight.actual_arrival_datetime) || '-'}
                  </div>
                </div>
              </div>

              {editingThisRow && (
                <div className="row mt-2">
                  <div className="col-md-4 mb-3">
                    <strong>Aircraft</strong>
                    <select
                      name="aircraft_id"
                      value={editedFlight.aircraft_id}
                      onChange={handleFieldChange}
                      className="form-control form-control-sm mt-2"
                    >
                      <option value="">Select Aircraft</option>
                      {dropdowns.aircrafts
                        .filter((aircraft) => aircraft.status_name === 'Active')
                        .map((aircraft) => (
                          <option
                            key={aircraft.aircraft_id}
                            value={aircraft.aircraft_id}
                          >
                            {aircraft.aircraft_name} ({aircraft.status_name})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <strong>Manager Action</strong>
                    <select
                      name="manager_action"
                      value={editedFlight.manager_action}
                      onChange={handleFieldChange}
                      className="form-control form-control-sm mt-2"
                    >
                      <option value="">No special action</option>
                      <option value="delay">Delay Flight</option>
                      <option value="cancel">Cancel Flight</option>
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <strong>Departure Gate</strong>
                    <select
                      name="departure_gate_id"
                      value={editedFlight.departure_gate_id}
                      onChange={handleFieldChange}
                      className="form-control form-control-sm mt-2"
                    >
                      <option value="">Select Departure Gate</option>
                      {dropdowns.gates
                        .filter((gate) => String(gate.airport_id) === String(flight.departure_airport_id))
                        .map((gate) => (
                          <option key={gate.gate_id} value={gate.gate_id}>
                            {gate.iata_code} - {gate.terminal_name} - Gate {gate.gate_number}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <strong>Arrival Gate</strong>
                    <select
                      name="arrival_gate_id"
                      value={editedFlight.arrival_gate_id}
                      onChange={handleFieldChange}
                      className="form-control form-control-sm mt-2"
                    >
                      <option value="">Select Arrival Gate</option>
                      {dropdowns.gates
                        .filter((gate) => String(gate.airport_id) === String(flight.arrival_airport_id))
                        .map((gate) => (
                          <option key={gate.gate_id} value={gate.gate_id}>
                            {gate.iata_code} - {gate.terminal_name} - Gate {gate.gate_number}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <strong>Scheduled Departure</strong>
                    {showDelaySchedule ? (
                      <input
                        type="datetime-local"
                        name="scheduled_departure_datetime"
                        value={editedFlight.scheduled_departure_datetime}
                        onChange={handleFieldChange}
                        className="form-control form-control-sm mt-2"
                      />
                    ) : (
                      <div className="mt-2">
                        {formatDateTime(flight.scheduled_departure_datetime)}
                      </div>
                    )}
                  </div>

                  <div className="col-md-3 mb-3">
                    <strong>Scheduled Arrival</strong>
                    <div className="mt-2">
                      {formatDateTime(flight.scheduled_arrival_datetime)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default FlightManagement;
