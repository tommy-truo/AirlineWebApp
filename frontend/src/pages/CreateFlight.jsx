import React, { useState, useEffect } from 'react';
import '../components/styles.css';

function CreateFlight() {

    const [form, setForm] = useState({
        flight_route_id: '',
        aircraft_id: '',
        departure_gate_id: '',
        arrival_gate_id: '',
        status_id: '',
        status_reason_id: '',
        scheduled_departure_datetime: '',
        scheduled_arrival_datetime: ''
    });

    const [dropdowns, setDropdowns] = useState({
        routes: [],
        aircrafts: [],
        gates: [],
        statuses: [],
        reasons: []
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDropdowns();
    }, []);

    async function fetchDropdowns() {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const res = await fetch(`${API_BASE_URL}/api/flights/dropdowns`);

            if (!res.ok) {
                throw new Error('Failed to load dropdowns');
            }

            const data = await res.json();
            setDropdowns(data);

        } catch (err) {
            console.error(err);
            setError('Error loading dropdown options.');
        }
    }

    const handleChange = (e) => {
        const { id, value } = e.target;
        setForm({ ...form, [id]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API_BASE_URL}/api/flights/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                throw new Error('Failed to create flight');
            }

            await res.json();

            setMessage('Flight created successfully.');
            setError('');

            setForm({
                flight_route_id: '',
                aircraft_id: '',
                departure_gate_id: '',
                arrival_gate_id: '',
                status_id: '',
                status_reason_id: '',
                scheduled_departure_datetime: '',
                scheduled_arrival_datetime: ''
            });

        } catch (err) {
            console.error(err);
            setError('Error creating flight.');
            setMessage('');
        }
    };

    return (
        <div className="container-fluid form-wrapper">
            <div className="card signup-container shadow-sm border-danger">
                <div className="card-body">

                    <h2 className="form-title mb-3">Create New Flight</h2>
                    <p className="text-muted">
                        Enter the scheduled flight details below.
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

                        {/* FLIGHT INFO */}
                        <div className="form-section mb-4">
                            <h5 className="section-title">Flight Information</h5>

                            <div className="row">

                                <div className="col-md-6 mb-3 form-field">
                                    <label>Flight Route*</label>
                                    <select
                                        id="flight_route_id"
                                        className="form-control"
                                        value={form.flight_route_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Route</option>
                                        {dropdowns.routes.map((route) => (
                                            <option
                                                key={route.flight_route_id}
                                                value={route.flight_route_id}
                                            >
                                                {route.flight_number} — {route.departure_city} → {route.arrival_city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3 form-field">
                                    <label>Aircraft*</label>
                                    <select
                                        id="aircraft_id"
                                        className="form-control"
                                        value={form.aircraft_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Aircraft</option>
                                        {dropdowns.aircrafts.map((aircraft) => (
                                            <option
                                                key={aircraft.aircraft_id}
                                                value={aircraft.aircraft_id}
                                            >
                                                Aircraft {aircraft.aircraft_id}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        </div>

                        {/* GATES */}
                        <div className="form-section mb-4">
                            <h5 className="section-title">Gate Information</h5>

                            <div className="row">

                                <div className="col-md-6 mb-3 form-field">
                                    <label>Departure Gate*</label>
                                    <select
                                        id="departure_gate_id"
                                        className="form-control"
                                        value={form.departure_gate_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Departure Gate</option>
                                        {dropdowns.gates.map((gate) => (
                                            <option key={gate.gate_id} value={gate.gate_id}>
                                                {gate.iata_code} - {gate.terminal_name} - Gate {gate.gate_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3 form-field">
                                    <label>Arrival Gate*</label>
                                    <select
                                        id="arrival_gate_id"
                                        className="form-control"
                                        value={form.arrival_gate_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Arrival Gate</option>
                                        {dropdowns.gates.map((gate) => (
                                            <option key={gate.gate_id} value={gate.gate_id}>
                                                {gate.iata_code} - {gate.terminal_name} - Gate {gate.gate_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        </div>

                        {/* SCHEDULE */}
                        <div className="form-section mb-4">
                            <h5 className="section-title">Schedule</h5>

                            <div className="row">

                                <div className="col-md-6 mb-3 form-field">
                                    <label>Scheduled Departure*</label>
                                    <input
                                        type="datetime-local"
                                        id="scheduled_departure_datetime"
                                        className="form-control"
                                        value={form.scheduled_departure_datetime}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3 form-field">
                                    <label>Scheduled Arrival*</label>
                                    <input
                                        type="datetime-local"
                                        id="scheduled_arrival_datetime"
                                        className="form-control"
                                        value={form.scheduled_arrival_datetime}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                            </div>
                        </div>

                        <button type="submit" className="login-button">
                            Create Flight
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}

export default CreateFlight;
