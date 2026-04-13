import { useEffect, useState } from 'react';

function FlightReports({ employeeId = 1}) {
//pendingflighs
const [pendingFlights, setPendingFlights] = useState([]);

// reports
const [reports, setReports] = useState([]);
//selected flights
const [selectedFlight , setSelectedFlight] = useState(null);

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

useEffect(() => {
        fetch(`${API_URL}/api/pilot/flight_reports?employee_id=${employeeId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch scheduled flights');
                }
                return res.json();
            })
            .then((data) => {
                setReports(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load report/log data.');
            });
    }, [API_URL, employeeId]);

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
            .then((res) =>{
                if(!res.ok){
                    throw new Error('Faliled to fetch flight reports');
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


}
