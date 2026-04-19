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

        setForm(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedFlight = flights.find(f => f.flight_instance_id == form.flight_instance_id);

        if (!selectedFlight) {
            setError("Select a valid flight.");
            return;
        }

        if (form.discount_type === 'Percentage') {
            if (form.discount_value < 5 || form.discount_value > 20) {
                setError('Percentage must be between 5 and 20.');
                return;
            }
        }

        if (form.discount_type === 'Fixed') {
            if (form.discount_value < 1 || form.discount_value > 150) {
                setError('Fixed discount must be between $1 and $150.');
                return;
            }
        }

        try {
            await fetch(`${API_BASE_URL}/api/flash-sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    start_datetime: selectedFlight.scheduled_departure_datetime,
                    end_datetime: selectedFlight.scheduled_arrival_datetime,
                    discount_type: form.discount_type,
                    discount_value: form.discount_value,
                    departure_iata: selectedFlight.departure_airport_iata,
                    arrival_iata: selectedFlight.arrival_airport_iata,
                    is_active: form.is_active
                })
            });

            setMessage('Flash sale created.');
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
        }
    };

    return (
        <div className="container-fluid form-wrapper">
            <div className="card signup-container border-danger shadow-sm">
                <div className="card-body">

                    <h2 className="form-title">Create Flash Sale</h2>

                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>

                        <input
                            id="name"
                            className="form-control mb-2"
                            placeholder="Sale Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                        <select
                            id="flight_instance_id"
                            className="form-control mb-2"
                            value={form.flight_instance_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Flight</option>
                            {flights.map(f => (
                                <option key={f.flight_instance_id} value={f.flight_instance_id}>
                                    {f.flight_number} — {f.departure_city} → {f.arrival_city} — {formatDateTime(f.scheduled_departure_datetime)}
                                </option>
                            ))}
                        </select>

                        <select
                            id="discount_type"
                            className="form-control mb-2"
                            value={form.discount_type}
                            onChange={handleChange}
                        >
                            <option value="Percentage">Percentage</option>
                            <option value="Fixed">Fixed ($)</option>
                        </select>

                        {form.discount_type === 'Percentage' ? (
                            <select
                                id="discount_value"
                                className="form-control mb-2"
                                value={form.discount_value}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Percentage</option>
                                {[5, 10, 15, 20].map(p => (
                                    <option key={p} value={p}>{p}%</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="number"
                                id="discount_value"
                                className="form-control mb-2"
                                placeholder="Enter amount ($1–$150)"
                                min="1"
                                max="150"
                                value={form.discount_value}
                                onChange={handleChange}
                                required
                            />
                        )}

                        <label className="mb-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                            /> Active
                        </label>

                        <button className="login-button">Create Flash Sale</button>

                    </form>

                </div>
            </div>
        </div>
    );
}

export default CreateFlashSale;
