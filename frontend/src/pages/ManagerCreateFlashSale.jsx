import { useState, useEffect } from 'react';
import '../components/styles.css';

function CreateFlashSale() {
    const [form, setForm] = useState({
        name: '',
        flight_instance_id: '',
        discount_type: 'Percentage',
        discount_value: '',
        is_active: false
    });

    const [flights, setFlights] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchFlights();
    }, []);

    function formatDateTime(date) {
        return new Date(date).toLocaleString();
    }

    async function fetchFlights() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/flights/all`);
            const data = await res.json();
            setFlights(data);
        } catch {
            setError('Error loading flights.');
        }
    }

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedFlight = flights.find(
            (flight) => String(flight.flight_instance_id) === String(form.flight_instance_id)
        );

        if (!selectedFlight) {
            setError("Select a valid flight.");
            setMessage('');
            return;
        }

        if (form.discount_type === 'Percentage') {
            if (form.discount_value < 5 || form.discount_value > 20) {
                setError('Percentage must be between 5 and 20.');
                setMessage('');
                return;
            }
        }

        if (form.discount_type === 'Fixed') {
            if (form.discount_value < 1 || form.discount_value > 150) {
                setError('Fixed discount must be between $1 and $150.');
                setMessage('');
                return;
            }
        }

        try {
    const res = await fetch(`${API_BASE_URL}/api/flash-sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: form.name,
            start_datetime: new Date(),
            end_datetime: selectedFlight.scheduled_departure_datetime,
            discount_type: form.discount_type,
            discount_value: form.discount_value,
            departure_iata: selectedFlight.departure_airport_iata,
            arrival_iata: selectedFlight.arrival_airport_iata,
            is_active: form.is_active
        })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Error creating sale.');
    }

    setMessage(data.message || 'Flash sale created.');
    setError('');

            setForm({
                name: '',
                flight_instance_id: '',
                discount_type: 'Percentage',
                discount_value: '',
                is_active: false
            });

        } catch {
            setError('Error creating sale.');
            setMessage('');
        }
    };

    const selectedFlight = flights.find(
        (flight) => String(flight.flight_instance_id) === String(form.flight_instance_id)
    );

    return (
        <div className="container-fluid form-wrapper">
            <div className="card signup-container border-danger shadow-sm">
                <div className="card-body">

                    <h2 className="form-title mb-3">Create Flash Sale</h2>
                    <p className="text-muted">
                        Create a flash sale for an existing upcoming flight. The sale end time will match the selected flight’s scheduled departure.
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
                                Sale Information
                            </h5>

                            <div className="row">
                                <div className="col-md-6 mb-3 form-field">
                                    <label>Sale Name*</label>
                                    <input
                                        id="name"
                                        className="form-control"
                                        placeholder="Sale Name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3 form-field">
                                    <label>Active?</label>
                                    <div className="form-check mt-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            className="form-check-input"
                                            checked={form.is_active}
                                            onChange={handleChange}
                                        />
                                        {/* <label className="form-check-label" htmlFor="is_active">
                                            Active
                                        </label> */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-section mb-4">
                            <h5 className="section-title">
                                Flight Selection
                            </h5>

                            <div className="row">
                                <div className="col-md-12 mb-3 form-field">
                                    <label>Flight*</label>
                                    <select
                                        id="flight_instance_id"
                                        className="form-control"
                                        value={form.flight_instance_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Flight</option>
                                        {flights
                                            .filter((flight) => new Date(flight.scheduled_departure_datetime) > new Date())
                                            .map((flight) => (
                                                <option key={flight.flight_instance_id} value={flight.flight_instance_id}>
                                                    {flight.flight_number} — {flight.departure_city} → {flight.arrival_city} — {formatDateTime(flight.scheduled_departure_datetime)}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            {selectedFlight && (
                                <div className="row">
                                    <div className="col-md-6 mb-3 form-field">
                                        <label>Sale Start</label>
                                        <div className="form-control bg-light">
                                            Starts immediately when created
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-3 form-field">
                                        <label>Sale End</label>
                                        <div className="form-control bg-light">
                                            {formatDateTime(selectedFlight.scheduled_departure_datetime)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-section mb-4">
                            <h5 className="section-title">
                                Discount Information
                            </h5>

                            <div className="row">
                                <div className="col-md-6 mb-3 form-field">
                                    <label>Discount Type*</label>
                                    <select
                                        id="discount_type"
                                        className="form-control"
                                        value={form.discount_type}
                                        onChange={handleChange}
                                    >
                                        <option value="Percentage">Percentage</option>
                                        <option value="Fixed">Fixed ($)</option>
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3 form-field">
                                    <label>Discount Value*</label>
                                    {form.discount_type === 'Percentage' ? (
                                        <select
                                            id="discount_value"
                                            className="form-control"
                                            value={form.discount_value}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Percentage</option>
                                            {[5, 10, 15, 20].map((percentage) => (
                                                <option key={percentage} value={percentage}>
                                                    {percentage}%
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="number"
                                            id="discount_value"
                                            className="form-control"
                                            placeholder="Enter amount ($1–$150)"
                                            min="1"
                                            max="150"
                                            value={form.discount_value}
                                            onChange={handleChange}
                                            required
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <button className="login-button">
                            Create Flash Sale
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}

export default CreateFlashSale;
