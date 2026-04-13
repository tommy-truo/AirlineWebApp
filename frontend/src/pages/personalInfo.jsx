import { useEffect, useState } from 'react';

function PersonalInfo({ employeeId = 1 }) {
    const [info, setInfo] = useState(null);
    const [formData, setFormData] = useState({
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: ''
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetch(`${API_URL}/api/pilot/profile?employee_id=${employeeId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch profile');
                }
                return res.json();
            })
            .then((data) => {
                setInfo(data);
                setFormData({
                    emergency_contact_name: data.emergency_contact_name || '',
                    emergency_contact_phone: data.emergency_contact_phone || '',
                    emergency_contact_relationship: data.emergency_contact_relationship || ''
                });
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load personal info.');
            });
    }, [API_URL, employeeId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch(`${API_URL}/api/pilot/profile/emergency-contact`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employee_id: employeeId,
                ...formData
            })
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to update emergency contact');
                }
                return res.json();
            })
            .then((data) => {
                setSuccessMessage(data.message);
                setError('');
                setInfo((prev) => ({
                    ...prev,
                    ...formData
                }));
            })
            .catch((err) => {
                console.error(err);
                setError('Could not update emergency contact.');
            });
    };

    return (
        <div className="page">
            <h2 style={{ textAlign: 'center', marginBottom: '6px', color: '#777' }}>
                Pilot Dashboard
            </h2>

            <h1 className="title" style={{ marginBottom: '4px' }}>
                Personal Info / HR
            </h1>

            <p
                style={{
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '16px',
                    marginTop: '0',
                    marginBottom: '24px'
                }}
            >
                Employee Information and Emergency Contact
            </p>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {successMessage && (
                <p style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>
            )}

            {info && (
                <>
                    <div className="summary-cards">
                        <div className="summary-card">
                            <h3>Position</h3>
                            <p>{info.title_name || 'N/A'}</p>
                        </div>

                        <div className="summary-card">
                            <h3>Department</h3>
                            <p>{info.department_name || 'N/A'}</p>
                        </div>

                        <div className="summary-card">
                            <h3>Salary</h3>
                            <p>
                                {info.salary != null
                                    ? `$${Number(info.salary).toLocaleString()}`
                                    : 'N/A'}
                            </p>
                        </div>

                        <div className="summary-card">
                            <h3>Start Date</h3>
                            <p>
                                {info.start_date
                                    ? new Date(info.start_date).toLocaleDateString()
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div
                        className="table-wrapper"
                        style={{ padding: '30px', marginTop: '20px' }}
                    >
                        <h2 className="title" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                            Employee Information
                        </h2>

                        <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
                            <input
                                type="text"
                                value={info.first_name || ''}
                                disabled
                                placeholder="First Name"
                            />

                            <input
                                type="text"
                                value={info.middle_initial || ''}
                                disabled
                                placeholder="Middle Initial"
                            />

                            <input
                                type="text"
                                value={info.last_name || ''}
                                disabled
                                placeholder="Last Name"
                            />

                            <input
                                type="email"
                                value={info.email || ''}
                                disabled
                                placeholder="Email"
                            />
                        </div>

                        <h2 className="title" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                            Update Emergency Contact
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <input
                                    name="emergency_contact_name"
                                    value={formData.emergency_contact_name}
                                    onChange={handleChange}
                                    placeholder="Contact Name"
                                />

                                <input
                                    name="emergency_contact_phone"
                                    value={formData.emergency_contact_phone}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                />

                                <input
                                    name="emergency_contact_relationship"
                                    value={formData.emergency_contact_relationship}
                                    onChange={handleChange}
                                    placeholder="Relationship"
                                />

                                <button
                                    type="submit"
                                    className="action-button"
                                    style={{
                                        backgroundColor: '#3498db',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    Save Emergency Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}

export default PersonalInfo;