import { useState, useEffect } from 'react';
import '../styles/styles.css';

function FlashSaleManagement() {

    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchData();
    }, []);

    function formatDateTime(date) {
        return new Date(date).toLocaleString();
    }

    async function fetchData() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/flash-sales`);
            const sales = await res.json();
            setData(sales);
        } catch {
            setError("Error loading flash sales.");
        }
    }

    async function toggleStatus(id, current) {
        await fetch(`${API_BASE_URL}/api/flash-sales/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !current })
        });

        fetchData();
    }

    async function deleteSale(id) {
        await fetch(`${API_BASE_URL}/api/flash-sales/${id}`, {
            method: 'DELETE'
        });

        fetchData();
    }

    const filtered = data.filter(s => {
        const matchesSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.departure_iata.toLowerCase().includes(search.toLowerCase()) ||
            s.arrival_iata.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && Number(s.is_active) === 1) ||
            (statusFilter === 'INACTIVE' && Number(s.is_active) === 0);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="container-fluid form-wrapper">
            <div className="card signup-container directory-card shadow-sm border-danger">
                <div className="card-body">

                    <h2 className="form-title mb-3">Flash Sale Management</h2>

                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="d-flex gap-2 mb-3 flex-wrap">

                        <input
                            className="form-control"
                            placeholder="Search by name or route"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ minWidth: "250px" }}
                        />

                        <select
                            className="form-control"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ minWidth: "200px" }}
                        >
                            <option value="ALL">All</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>

                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table className="table table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Discount</th>
                                    <th>Route</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Status</th>
                                    <th>Toggle Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map(s => (
                                    <tr key={s.flash_sale_id}>

                                        <td>{s.name}</td>

                                        <td>
                                            <span className="fw-bold text-danger">
                                                {s.discount_type === 'Fixed'
                                                    ? `$${Number(s.discount_value)}`
                                                    : `${Number(s.discount_value)}%`}
                                            </span>
                                        </td>

                                        <td>
                                            {s.departure_iata} → {s.arrival_iata}
                                        </td>

                                        <td>{formatDateTime(s.start_datetime)}</td>
                                        <td>{formatDateTime(s.end_datetime)}</td>

                                        <td>
                                            <span className={`status-badge ${Number(s.is_active) === 1 ? 'status-active' : 'status-inactive'}`}>
                                                {Number(s.is_active) === 1 ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm mx-1"
                                                onClick={() => toggleStatus(s.flash_sale_id, s.is_active)}
                                            >
                                                Toggle
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default FlashSaleManagement;