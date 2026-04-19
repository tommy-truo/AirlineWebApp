import React, { useState, useEffect } from 'react';
import '../components/styles.css';

function CreateFlight() {
    const [form, setForm] = useState({
        departure_city: '',
        arrival_city: '',
        flight_route_id: '',
        aircraft_id: '',
        departure_gate_id: '',
        arrival_gate_id: '',
        scheduled_departure_datetime: '',
        scheduled_arrival_datetime: ''
    });

    const [dropdowns, setDropdowns] = useState({
        routes: [],
        aircrafts: [],
        gates: []
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const departureCities = [...new Set(dropdowns.routes.map((route) => route.departure_city))].sort();

    const arrivalCities = [...new Set(
        dropdowns.routes
            .filter((route) =>
                !form.departure_city || route.departure_city === form.departure_city
            )
            .map((route) => route.arrival_city)
    )].sort();

    const filteredRoutes = dropdowns.routes.filter((route) => {
        const matchesDeparture =
            !form.departure_city || route.departure_city === form.departure_city;

        const matchesArrival =
            !form.arrival_city || route.arrival_city === form.arrival_city;

        return matchesDeparture && matchesArrival;
    });

    const selectedRoute = dropdowns.routes.find(
        (route) => String(route.flight_route_id) === String(form.flight_route_id)
    );

    const filteredDepartureGates = selectedRoute
        ? dropdowns.gates.filter(
            (gate) => String(gate.airport_id) === String(selectedRoute.departure_airport_id)
        )
        : [];

    const filteredArrivalGates = selectedRoute
        ? dropdowns.gates.filter(
            (gate) => String(gate.airport_id) === String(selectedRoute.arrival_airport_id)
        )
        : [];

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

            setDropdowns({
                routes: data.routes || [],
                aircrafts: data.aircrafts || [],
                gates: data.gates || []
            });

        } catch (err) {
            console.error(err);
            setError('Error loading dropdown options.');
        }
    }

    const handleChange = (e) => {
        const { id, value } = e.target;

        if (id === 'departure_city') {
            setForm((prev) => ({
                ...prev,
                departure_city: value,
                arrival_city: '',
                flight_route_id: '',
                departure_gate_id: '',
                arrival_gate_id: ''
            }));
            return;
        }

        if (id === 'arrival_city') {
            setForm((prev) => ({
                ...prev,
                arrival_city: value,
                flight_route_id: '',
                departure_gate_id: '',
                arrival_gate_id: ''
            }));
            return;
        }

        if (id === 'flight_route_id') {
            setForm((prev) => ({
                ...prev,
                flight_route_id: value,
                departure_gate_id: '',
                arrival_gate_id: ''
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.flight_route_id || !form.aircraft_id || !form.departure_gate_id || !form.arrival_gate_id) {
            setError('Please complete all required flight fields.');
            setMessage('');
            return;
        }

        if (!form.scheduled_departure_datetime || !form.scheduled_arrival_datetime) {
            setError('Please enter both scheduled departure and arrival times.');
            setMessage('');
            return;
        }

        if (new Date(form.scheduled_arrival_datetime) <= new Date(form.scheduled_departure_datetime)) {
            setError('Scheduled arrival must be after scheduled departure.');
            setMessage('');
            return;
        }

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const res = await fetch(`${API_BASE_URL}/api/flights/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    flight_route_id: form.flight_route_id,
                    aircraft_id: form.aircraft_id,
                    departure_gate_id: form.departure_gate_id,
                    arrival_gate_id: form.arrival_gate_id,
                    scheduled_departure_datetime: form.scheduled_departure_datetime,
                    scheduled_arrival_datetime: form.scheduled_arrival_datetime
                })
            });

            if (!res.ok) {
                throw new Error('Failed to create flight');
            }

            await res.json();

            setMessage('Flight created successfully.');
            setError('');

            setForm({
                departure_city: '',
                arrival_city: '',
                flight_route_id: '',
                aircraft_id: '',
                departure_gate_id: '',
                arrival_gate_id: '',
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

                        <div className="form-section mb-4">
                            <h5 className="section-title">Flight Information</h5>

                            <div className="row">
                                <div className="col-md-6 mb-3 form-field">
                                    <label>Departure City*</label>
                                    <select
                                        id="departure_city"
                                        className="form-control"
                                        value={form.departure_city}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Departure City</option>
                                        {departureCities.map((city) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3 form-field">
                                    <label>Arrival City*</label>
                                    <select
                                        id="arrival_city"
                                        className="form-control"
                                        value={form.arrival_city}
                                        onChange={handleChange}
                                        required
                                        disabled={!form.departure_city}
                                    >
                                        <option value="">Select Arrival City</option>
                                        {arrivalCities.map((city) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3 form-field">
                                    <label>Flight Route*</label>
                                    <select
                                        id="flight_route_id"
                                        className="form-control"
                                        value={form.flight_route_id}
                                        onChange={handleChange}
                                        required
                                        disabled={!form.departure_city || !form.arrival_city}
                                    >
                                        <option value="">Select Route</option>
                                        {filteredRoutes.map((route) => (
                                            <option
                                                key={route.flight_route_id}
                                                value={route.flight_route_id}
                                            >
                                                {route.flight_number} — {route.departure_iata} ({route.departure_city}) → {route.arrival_iata} ({route.arrival_city})
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
                                                {aircraft.aircraft_name} ({aircraft.status_name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

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
                                        disabled={!form.flight_route_id}
                                    >
                                        <option value="">Select Departure Gate</option>
                                        {filteredDepartureGates.map((gate) => (
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
                                        disabled={!form.flight_route_id}
                                    >
                                        <option value="">Select Arrival Gate</option>
                                        {filteredArrivalGates.map((gate) => (
                                            <option key={gate.gate_id} value={gate.gate_id}>
                                                {gate.iata_code} - {gate.terminal_name} - Gate {gate.gate_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

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
