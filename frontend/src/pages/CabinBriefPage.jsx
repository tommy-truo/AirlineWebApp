import { useState } from 'react';

const API = 'http://localhost:5001';

export default function CabinBriefPage() {
  const [flightId, setFlightId] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!flightId) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(`${API}/api/cabin-brief/flight/${flightId}`);
      if (res.status === 404) {
        setError('No tickets found for this flight.');
        return;
      }
      const data = await res.json();
      setResults(data);
    } catch {
      setError('Failed to fetch cabin brief.');
    } finally {
      setLoading(false);
    }
  }

  const total = results ? results.reduce((sum, r) => sum + r.passenger_count, 0) : 0;

  return (
    <div className="page">
      <h2 className="title">Cabin Brief</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: '30px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <input
          type="number"
          min="1"
          placeholder="Enter Flight Instance ID"
          value={flightId}
          onChange={(e) => setFlightId(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            fontSize: '1rem',
            width: '240px',
          }}
        />
        <button type="submit" className="action-button" disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {results && (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Passengers</h3>
              <p>{total}</p>
            </div>
            <div className="summary-card">
              <h3>Cabin Classes</h3>
              <p>{results.length}</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="shift-table">
              <thead>
                <tr>
                  <th>Cabin Class ID</th>
                  <th>Class Name</th>
                  <th>Passenger Count</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.cabin_class_id}>
                    <td>{r.cabin_class_id}</td>
                    <td>{r.class_name}</td>
                    <td>{r.passenger_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
