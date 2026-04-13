import { useEffect, useState } from 'react';

function FlightReports({ employeeId = 1 }) {
    //pendingflighs
    const [pendingFlights, setPendingFlights] = useState([]);

    // reports
    const [reports, setReports] = useState([]);
    //selected flights
    const [selectedFlight, setSelectedFlight] = useState(null);

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        hours_flown: '',
        distance_flown_km: '',
        status: 'Completed',
        irregular_reason: '',
        notes: ''
    });

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchPendingFlights = () => {
        fetch(`${API_URL}/api/pilot/flight_reports/pending?employee_id=${employeeId}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch pending flights');
                return res.json();
            })
            .then((data) => {
                setPendingFlights(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load flights needing reports.');
            });
    };

    const fetchReports = () => {
        fetch(`${API_URL}/api/pilot/flight_reports?employee_id=${employeeId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch flight reports');
                }
                return res.json();
            })
            .then((data) => {
                setReports(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load flight reports.');
            });
    };

    useEffect(() => {
        fetchPendingFlights();
        fetchReports();
    }, [API_URL, employeeId]);

    const totalHours = reports.reduce(
        (sum, report) => sum + (Number(report.hours_flown)|| 0),
        0
    );

    const totalDist =reports.reduce(
        (sum, report) => sum + (Number(report.distance_flown_km)|| 0),
        0
    );

    const irregularCnt = reports.filter(
        (report) => report.status && report.status != 'Completed'
    ).length;

    return (
        <div className="page">
            <h2 style={{ textAlign: 'center', marginBottom: '6px', color: '#777' }}>
                Pilot Dashboard
            </h2>

            <h1 className='title'>
                Flight Reports / Logs
            </h1>

            <p
                style={{
                    textAlign: 'center',
                    marginBottom: '24px',
                    marginTop: '0',
                    color: '#999',
                    fontSize: '16px'
                }}
            >
                Submit completed flights and view report history
            </p>

            {error && <p style={{color: 'red', textAlign: 'center' }}>{error}</p>}
            {successMessage && (<p style={{color: 'green', textAlign: 'center' }}>{successMessage}</p>)}

            {/* summary */}
            <div className="summary-cards">
                <div className="summary-card">
                    <h3>Total Logged Flights</h3>
                    <p>0</p>
                </div>

                <div className="summary-card">
                    <h3>Total Hours Flown</h3>
                    <p>{totalHours}</p>
                </div>

                <div className="summary-card">
                    <h3>Total Distance Flown</h3>
                    <p>{totalDist}</p>
                </div>

                <div className="summary-card">
                    <h3>Irregular Flights</h3>
                    <p>{irregularCnt}</p>
                </div>
            </div>

        </div>
    );
}

export default FlightReports;