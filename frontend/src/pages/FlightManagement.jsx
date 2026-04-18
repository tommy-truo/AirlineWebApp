import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import '../components/styles.css';

function FlightManagement() {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedFlight, setEditedFlight] = useState({});
  const [dropdowns, setDropdowns] = useState({
    statuses: [],
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
      const res = await fetch(`${API_BASE_URL}/api/flights/dropdowns`);

      if (!res.ok) {
        throw new Error("Failed to fetch flight dropdown data");
      }

      const result = await res.json();

      setDropdowns({
        statuses: result.statuses || [],
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

  function isClosedFlight(flight) {
    return flight.status_id === 4 || flight.status_id === 7;
  }

  function needsReason(statusId) {
    return Number(statusId) === 3 || Number(statusId) === 4;
  }

  function canEditSchedule(statusId) {
    return Number(statusId) === 3;
  }

  function getAllowedStatuses(currentStatusId) {
    const id = Number(currentStatusId);

    const allowedMap = {
      1: [2, 3, 4],
      2: [3, 5, 6, 4],
      3: [2, 5, 6, 4],
      4: [],
      5: [6, 7],
      6: [7],
      7: []
    };

    const allowedIds = allowedMap[id] || [];

    return dropdowns.statuses.filter((status) =>
      allowedIds.includes(Number(status.flight_status_id))
    );
  }

  function handleEditClick(flight) {
    setEditingId(flight.flight_instance_id);
    setEditedFlight({
      flight_instance_id: flight.flight_instance_id,
      aircraft_id: flight.aircraft_id || '',
      departure_gate_id: flight.departure_gate_id || '',
      arrival_gate_id: flight.arrival_gate_id || '',
      status_id: flight.status_id || '',
      status_reason_id: flight.status_reason_id || '',
      scheduled_departure_datetime: '',
      scheduled_arrival_datetime: ''
    });
  }

  function handleFieldChange(e) {
    const { name, value } = e.target;

    setEditedFlight((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'status_id' && !needsReason(value)) {
        updated.status_reason_id = '6';
      }

      return updated;
    });
  }

  async function handleSaveEdit(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/flights/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editedFlight)
      });

      if (!res.ok) {
        throw new Error("Failed to update flight");
      }

      setEditingId(null);
      setEditedFlight({});
      setMessage("Flight updated successfully.");
      setError('');
      fetchFlights();
    } catch (err) {
      console.log(err);
      setError("Error updating flight.");
      setMessage('');
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditedFlight({});
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

  return (
    <div className="container-fluid form-wrapper">
      <div className="card signup-container directory-card shadow-sm border-danger">
        <div className="card-body">
          <h2 className="form-title mb-3">Flight Management</h2>

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
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Flight #</th>
                  <th>Route</th>
                  <th>Aircraft</th>
                  <th>Departure Gate</th>
                  <th>Arrival Gate</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Scheduled Departure</th>
                  <th>Scheduled Arrival</th>
                  <th>Actual Departure</th>
                  <th>Actual Arrival</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentFlights.map((flight) => {
                  const closedFlight = isClosedFlight(flight);
                  const editingThisRow = editingId === flight.flight_instance_id;
                  const selectedStatusId = editingThisRow ? editedFlight.status_id : flight.status_id;

                  return (
                    <tr key={flight.flight_instance_id}>
                      <td>{flight.flight_number}</td>

                      <td className="text-nowrap">
                        {flight.departure_city} → {flight.arrival_city}
                      </td>

                      <td>
                        {editingThisRow ? (
                          <select
                            name="status_id"
                            value={editedFlight.status_id}
                            onChange={handleFieldChange}
                            className="form-control form-control-sm"
                          >
                            <option value="">Select Status</option>
                            {getAllowedStatuses(flight.status_id).map((status) => (
                              <option
                                key={status.flight_status_id}
                                value={status.flight_status_id}
                              >
                                {status.status_name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`status-badge ${getFlightStatusClass(flight.status_name)}`}>
                            {flight.status_name}
                          </span>
                        )}
                      </td>

                      <td className="text-nowrap">
                        {editingThisRow ? (
                          <select
                            name="departure_gate_id"
                            value={editedFlight.departure_gate_id}
                            onChange={handleFieldChange}
                            className="form-control form-control-sm"
                          >
                            <option value="">Select Departure Gate</option>
                            {dropdowns.gates.map((gate) => (
                              <option
                                key={gate.gate_id}
                                value={gate.gate_id}
                              >
                                {gate.iata} - {gate.terminal_name} - Gate {gate.gate_number}
                              </option>
                            ))}
                          </select>
                        ) : (
                          `${flight.departure_airport_iata} - ${flight.departure_terminal} - Gate ${flight.departure_gate_number}`
                        )}
                      </td>

                      <td className="text-nowrap">
                        {editingThisRow ? (
                          <select
                            name="arrival_gate_id"
                            value={editedFlight.arrival_gate_id}
                            onChange={handleFieldChange}
                            className="form-control form-control-sm"
                          >
                            <option value="">Select Arrival Gate</option>
                            {dropdowns.gates.map((gate) => (
                              <option
                                key={gate.gate_id}
                                value={gate.gate_id}
                              >
                                {gate.iata} - {gate.terminal_name} - Gate {gate.gate_number}
                              </option>
                            ))}
                          </select>
                        ) : (
                          `${flight.arrival_airport_iata} - ${flight.arrival_terminal} - Gate ${flight.arrival_gate_number}`
                        )}
                      </td>

                      <td>
                        {editingThisRow ? (
                          <select
                            name="status_id"
                            value={editedFlight.status_id}
                            onChange={handleFieldChange}
                            className="form-control form-control-sm"
                          >
                            <option value="">Select Status</option>
                            {getAllowedStatuses(flight.status_id).map((status) => (
                              <option
                                key={status.flight_status_id}
                                value={status.flight_status_id}
                              >
                                {status.status_name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          flight.status_name
                        )}
                      </td>

                      <td>
                        {editingThisRow ? (
                          needsReason(selectedStatusId) ? (
                            <select
                              name="status_reason_id"
                              value={editedFlight.status_reason_id}
                              onChange={handleFieldChange}
                              className="form-control form-control-sm"
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
                            <span className="text-muted">Not needed</span>
                          )
                        ) : (
                          flight.reason_name || '-'
                        )}
                      </td>

                      <td>
                        {editingThisRow && canEditSchedule(selectedStatusId) ? (
                          <input
                            type="datetime-local"
                            name="scheduled_departure_datetime"
                            value={editedFlight.scheduled_departure_datetime}
                            onChange={handleFieldChange}
                            className="form-control form-control-sm"
                          />
                        ) : (
                          flight.scheduled_departure_datetime
                        )}
                      </td>

                      <td>
                        {editingThisRow && canEditSchedule(selectedStatusId) ? (
                          <input
                            type="datetime-local"
                            name="scheduled_arrival_datetime"
                            value={editedFlight.scheduled_arrival_datetime}
                            onChange={handleFieldChange}
                            className="form-control form-control-sm"
                          />
                        ) : (
                          flight.scheduled_arrival_datetime
                        )}
                      </td>

                      <td>{flight.actual_departure_datetime}</td>
                      <td>{flight.actual_arrival_datetime}</td>

                      <td>
                        {editingThisRow ? (
                          <>
                            <button
                              className="btn btn-success mx-1"
                              onClick={() => handleSaveEdit(flight.flight_instance_id)}
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
                        ) : closedFlight ? (
                          <span className="text-muted fw-semibold">Closed</span>
                        ) : (
                          <button
                            className="btn btn-primary mx-1"
                            onClick={() => handleEditClick(flight)}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

export default FlightManagement;
