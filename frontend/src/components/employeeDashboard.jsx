import React, { useState, useEffect } from "react";
import "./employeeDashboard.css";
import printBoardingPass from "./printBoardingPass.jsx";

const API = import.meta.env.VITE_API_URL || "https://airlinewebapp.onrender.com";

const Dashboard = ({ onLogout }) => {
    const [selectedAirport, setSelectedAirport] = useState(() => sessionStorage.getItem("selectedStation") || "");
    const [airports, setAirports] = useState([]);
    const [flights, setFlights] = useState([]);
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem("activeTab") || "flight-schedules");
    const [ticketNumber, setTicketNumber] = useState("");
    const [searchError, setSearchError] = useState("");
    const [passenger, setPassenger] = useState(null);
    const [baggageInputs, setBaggageInputs] = useState({});
    const [showBaggageForm, setShowBaggageForm] = useState({});
    const [paymentSteps, setPaymentSteps] = useState({});
    const [cardDetails, setCardDetails] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    

    useEffect(() => {
        fetch(`${API}/api/employee/airports`).then(res => res.json()).then(setAirports);
    }, []);

    useEffect(() => {
        if (selectedAirport) {
            sessionStorage.setItem("selectedStation", selectedAirport);
            fetch(`${API}/api/employee/dashboard-info?airport=${selectedAirport}`)
                .then(res => res.json())
                .then(setFlights);
        }
    }, [selectedAirport]);

    useEffect(() => {
        localStorage.setItem("activeTab", activeTab);
    }, [activeTab]);

    const handleTicketSearch = async () => {
        if (!ticketNumber || isProcessing) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`${API}/api/employee/checkin?ticket=${ticketNumber.trim()}`);
            const data = await res.json();
            if (res.ok) {
                const results = Array.isArray(data) ? data : [data];
                setPassenger(results);
                setSearchError("");
                const initialBaggage = {};
                results.forEach(p => {
                    initialBaggage[p.ticket_id] = { count: "", weights: [] };
                });
                setBaggageInputs(initialBaggage);
                setShowBaggageForm({});
                setPaymentSteps({});
                setCardDetails({});
            } else {
                setPassenger(null);
                setSearchError("No ticket found. Please check the ticket number and try again.");
            }
        } catch (err) {
            console.error("Search failed:", err);
            setPassenger(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinalizePayment = async (p) => {
        if (isProcessing) return;
        const currentBaggage = baggageInputs[p.ticket_id] || { count: 0, weights: [] };
        const cleanWeights = currentBaggage.weights
            .map(w => parseFloat(w))
            .filter(w => !isNaN(w) && w > 0);
        if (cleanWeights.length === 0) {
            alert("Please enter valid baggage weights.");
            return;
        }
        const baggageFee = (parseInt(currentBaggage.count) || 0) * 50;
        setIsProcessing(true);
        try {
            const res = await fetch(`${API}/api/employee/create-transaction`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking_id: p.booking_id,
                    ticket_id: p.ticket_id,
                    amount: baggageFee,
                    baggage_weights: cleanWeights
                })
            });
            if (res.ok) {
                setBaggageInputs(prev => ({ ...prev, [p.ticket_id]: { count: "", weights: [] } }));
                setShowBaggageForm(prev => ({ ...prev, [p.ticket_id]: false }));
                setPaymentSteps(prev => ({ ...prev, [p.ticket_id]: "input" }));
                await handleTicketSearch();
            } else {
                const errorData = await res.json();
                alert("Payment failed: " + errorData.error);
            }
        } catch (err) {
            console.error("Transaction Error:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmCheckIn = async (tId) => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`${API}/api/employee/confirm-checkin`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticket_id: tId })
            });
            if (res.ok) await handleTicketSearch();
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCountChange = (tId, newCount) => {
        if (newCount === "") {
            setBaggageInputs(prev => ({ ...prev, [tId]: { count: "", weights: [] } }));
            return;
        }
        const count = parseInt(newCount);
        setBaggageInputs(prev => {
            const currentWeights = prev[tId]?.weights || [];
            const newWeights = new Array(count).fill("").map((_, i) => currentWeights[i] ?? "");
            return { ...prev, [tId]: { count, weights: newWeights } };
        });
    };

    const handleWeightChange = (tId, index, value) => {
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        setBaggageInputs(prev => {
            const newWeights = [...prev[tId].weights];
            newWeights[index] = sanitizedValue;
            return { ...prev, [tId]: { ...prev[tId], weights: newWeights } };
        });
    };

    const handleCardChange = (tId, field, value) => {
        setCardDetails(prev => ({
            ...prev,
            [tId]: { ...(prev[tId] || { name: "", number: "", expiry: "", cvv: "" }), [field]: value }
        }));
    };

    const toggleBaggageForm = (tId) => {
        const isOpening = !showBaggageForm[tId];
        if (!isOpening) {
            setBaggageInputs(prev => ({ ...prev, [tId]: { count: "", weights: [] } }));
            setPaymentSteps(prev => ({ ...prev, [tId]: "input" }));
            setCardDetails(prev => ({ ...prev, [tId]: {} }));
        }
        setShowBaggageForm(prev => ({ ...prev, [tId]: isOpening }));
    };

    const formatTime = (dt) => {
        if (!dt) return "--:--";
        const date = new Date(dt.replace(" ", "T"));
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (dt) => {
        if (!dt) return "";
        const date = new Date(dt.replace(" ", "T"));
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    const handleSwitchStation = () => {
        sessionStorage.removeItem('selectedStation');
        localStorage.removeItem('activeTab');
        setSelectedAirport("");
        setFlights([]);
        setTicketNumber("");
        setPassenger(null);
        setSearchError("");
        setActiveTab("flight-schedules");
    };

    if (!selectedAirport) {
        return (
            <div className="selection-screen">
                <div className="selection-card">
                    <h2>Select Your Station</h2>
                    <div className="station-grid">
                        {airports.map(a => (
                            <button key={a.iata} className="station-btn" onClick={() => {
                                setSelectedAirport(a.iata);
                                setActiveTab("flight-schedules");}}>
                                {a.name} ({a.iata})
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const departingFlights = flights.filter(f => f.origin_iata === selectedAirport);
    const arrivingFlights = flights.filter(f => f.destination_iata === selectedAirport);
    const nextDep = departingFlights[0];
    const nextArr = arrivingFlights[0];

    const getStatusClass = (status) => {
        switch ((status || "").toLowerCase()) {
            case "on schedule":
                return "pill green";
            case "delayed":
                return "pill yellow";
            case "cancelled":
                return "pill red";
            case "boarding":
                return "pill blue";
            case "departed":
                return "pill gray";
            default:
            case "arrived":           // ✅ ADD THIS
                return "pill blue";
            return "pill";
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-brand">Airport Check-In</div>
                <nav className="sidebar-nav">
                    <div className={`nav-item ${activeTab === 'flight-schedules' ? 'active' : ''}`} onClick={() => setActiveTab('flight-schedules')}>Flight Schedules</div>
                    <div className={`nav-item ${activeTab === 'passenger-check-in' ? 'active' : ''}`} onClick={() => setActiveTab('passenger-check-in')}>Passenger Check-In</div>
                </nav>

                <button className="logout-btn" onClick={() => {
                    sessionStorage.clear();
                    onLogout();}}>LOGOUT</button>

            </aside>

            <main className="main-content">
                <header className="content-header">
                    <div className="header-left">
                        <span className="station-badge">{selectedAirport} Station</span>
                        <h1>{activeTab.replace("-", " ").toUpperCase()}</h1>
                    </div>
                    <button className="btn-switch" onClick={handleSwitchStation}>Switch Station</button>
                </header>

                {activeTab === "flight-schedules" && (
                    <div className="schedules-view">
                        <div className="hero-cards-row">
                            <div className="hero-card dep-border">
                                <span className="card-label">NEXT DEPARTURE</span>
                                <div className="hero-main">
                                        <span className="hero-id">{nextDep ? nextDep.flight_number : "None Scheduled"}</span>                                   
                                         <div className="hero-time-stack">
                                        <span className="hero-date">{formatDate(nextDep?.scheduled_departure_datetime)}</span>
                                        <span className="hero-time">{formatTime(nextDep?.scheduled_departure_datetime)}</span>
                                    </div>
                                </div>
                                <span className="hero-sub">To: {nextDep?.destination_iata || "---"}</span>
                            </div>

                            <div className="hero-card arr-border">
                                <span className="card-label">NEXT ARRIVAL</span>
                                <div className="hero-main">
                                <span className="hero-id">{nextArr ? nextArr.flight_number : "None Scheduled"}</span>
                                    <div className="hero-time-stack">
                                        <span className="hero-date">{formatDate(nextArr?.scheduled_arrival_datetime)}</span>
                                        <span className="hero-time">{formatTime(nextArr?.scheduled_arrival_datetime)}</span>
                                    </div>
                                </div>
                                <span className="hero-sub">From: {nextArr?.origin_iata || "---"}</span>
                            </div>
                        </div>

                        <div className="tables-grid">
                            <div className="table-card">
                                <div className="table-header dep-bg">UPCOMING DEPARTURES</div>
                                <table className="flight-table">
                                    <thead><tr><th>FLIGHT</th><th>TO</th><th>TIME</th><th>STATUS</th></tr></thead>
                                    <tbody>
                                        {departingFlights.length > 0 ? (
                                            departingFlights.map((f, i) => (
                                                <tr key={i}>
                                                    <td><b>{f.flight_number}</b></td>
                                                    <td>{f.destination_iata}</td>
                                                    <td>{formatTime(f.scheduled_departure_datetime)}</td>
                                                    <td><span className={getStatusClass(f.status_name)}>{f.status_name || "Unknown"}</span></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="4" className="empty-row">No remaining departures for today.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="table-card">
                                <div className="table-header arr-bg">UPCOMING ARRIVALS</div>
                                <table className="flight-table">
                                    <thead><tr><th>FLIGHT</th><th>FROM</th><th>TIME</th><th>STATUS</th></tr></thead>
                                    <tbody>
                                        {arrivingFlights.length > 0 ? (
                                            arrivingFlights.map((f, i) => (
                                                <tr key={i}>
                                                    <td><b>{f.flight_number}</b></td>
                                                    <td>{f.origin_iata}</td>
                                                    <td>{formatTime(f.scheduled_arrival_datetime)}</td>
                                                    <td><span className={getStatusClass(f.status_name)}>{f.status_name || "Unknown"}</span></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="4" className="empty-row">No remaining arrivals for today.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "passenger-check-in" && (
                    <div className="checkin-panel">
                        <div className="checkin-search">
                            <input
                                value={ticketNumber}
                                onChange={e => setTicketNumber(e.target.value)}
                                placeholder="Enter Ticket #"
                                className="checkin-input"
                                onKeyDown={(e) => e.key === 'Enter' && handleTicketSearch()}
                                disabled={isProcessing}
                            />
                            <button onClick={handleTicketSearch} className="checkin-btn" disabled={isProcessing}>
                                {isProcessing ? "..." : "Search"}
                            </button>
                        </div>

                        
                        {searchError && (
                            <div className="search-error-msg">{searchError}</div>
                        )}

                        <div className="passenger-results-container">
                            {passenger?.map((p, i) => {
                                const isActuallyCheckedIn = p.checked_in === 1 || p.checked_in === true;
                                const isFormOpen = showBaggageForm[p.ticket_id];
                                const currentBaggage = baggageInputs[p.ticket_id] || { count: "", weights: [] };
                                const isOverweight = currentBaggage.weights.some(w => parseFloat(w) > 20);
                                const isUnderweight = currentBaggage.weights.some(w => {
                                    const val = parseFloat(w);
                                    return isNaN(val) || val < 1;
                                });
                                const baggageFee = (parseInt(currentBaggage.count) || 0) * 50;
                                const step = paymentSteps[p.ticket_id] || "input";
                                const card = cardDetails[p.ticket_id] || {};
                                const isCardValid = (card.name?.length > 0) && (card.number?.length >= 15) && (card.expiry?.length >= 4) && (card.cvv?.length >= 3);

                                return (
                                    <div key={i} className="passenger-card checkin-card">
                                        <div className="checkin-card-body">
                                            <div className="passenger-details-grid">
                                                <div className="p-field"><b>Name</b><p>{p.first_name} {p.last_name}</p></div>
                                                <div className="p-field"><b>Flight</b><p>{p.flight_number}</p></div>
                                                <div className="p-field"><b>Route</b><p>{p.origin_iata || "—"} → {p.destination_iata || "—"}</p></div>
                                                <div className="p-field"><b>Seat</b><p>{p.seat_id || "Unassigned"}</p></div>
                                                <div className="p-field"><b>Bags</b><p>{p.baggage_count || 0}</p></div>
                                                <div className="p-field"><b>Total Weight</b><p>{parseFloat(p.baggage_weight || 0).toFixed(1)} lbs</p></div>
                                                <div className="p-field"><b>Status</b><p className={isActuallyCheckedIn ? "status-done" : "status-pending"}>{p.check_in_status}</p></div>
                                                <div className="p-field"><b>Boarding Group</b><p>{p.boarding_group || "—"}</p></div>
                                                <div className="p-field"><b>Passport</b><p>{p.passport_number || "—"}</p></div>
                                            </div>
                                        </div>
                                        {isActuallyCheckedIn && (
                                            <div className="boarding-pass-action">
                                                <button
                                                    className="btn-apply-baggage"
                                                    onClick={() => printBoardingPass(p)}
                                                > Print Boarding Pass</button>
                                            </div>
                                        )}

                                        {!isActuallyCheckedIn && (
                                            <>
                                                <div className="primary-action-area">
                                                    {p.origin_iata === selectedAirport ? (
                                                        <button
                                                            className="confirm-checkin-btn-large"
                                                            disabled={isProcessing}
                                                            onClick={() => handleConfirmCheckIn(p.ticket_id)}
                                                        >
                                                            Confirm Check-In
                                                        </button>
                                                    ) : (
                                                        <div className="wrong-station-message">
                                                            <p> This passenger must check in at {p.origin_iata} station</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="baggage-action-area">
                                                    {!isFormOpen ? (
                                                        <button className="btn-add-baggage" onClick={() => toggleBaggageForm(p.ticket_id)}>+ Add Baggage</button>
                                                    ) : (
                                                        <div className="baggage-entry-container">
                                                            {step === "input" ? (
                                                                <>
                                                                    <div className="baggage-form-header">
                                                                        <div className="action-input-group">
                                                                            <label>Number of Bags:</label>
                                                                            <select
                                                                                className="baggage-select"
                                                                                value={currentBaggage.count}
                                                                                onChange={(e) => handleCountChange(p.ticket_id, e.target.value)}
                                                                            >
                                                                                <option value="">-- Selection --</option>
                                                                                {[1, 2, 3, 4, 5].map(num => (
                                                                                    <option key={num} value={num}>{num}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    </div>

                                                                    {currentBaggage.count !== "" && (
                                                                        <>
                                                                            <div className="baggage-weights-grid">
                                                                                {currentBaggage.weights.map((weight, idx) => (
                                                                                    <div key={idx} className="weight-input-box">
                                                                                        <label>Bag {idx + 1} (lbs)</label>
                                                                                        <input
                                                                                            type="text"
                                                                                            className={`baggage-input ${(parseFloat(weight) > 20 || (weight !== "" && parseFloat(weight) < 1)) ? 'error-border' : ''}`}
                                                                                            value={weight}
                                                                                            onChange={(e) => handleWeightChange(p.ticket_id, idx, e.target.value)}
                                                                                        />
                                                                                    </div>
                                                                                ))}
                                                                            </div>

                                                                            <div className="baggage-form-footer">
                                                                                <div className="pricing-info"><span className="fee-value">${baggageFee}</span></div>
                                                                                <div className="footer-btns">
                                                                                    <button
                                                                                        className="btn-apply-baggage"
                                                                                        onClick={() => setPaymentSteps(prev => ({ ...prev, [p.ticket_id]: "payment" }))}
                                                                                        disabled={isOverweight || isUnderweight || currentBaggage.weights.length === 0}
                                                                                    >
                                                                                        Add & Pay
                                                                                    </button>
                                                                                    <button className="btn-cancel" onClick={() => toggleBaggageForm(p.ticket_id)}>Cancel</button>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <div className="payment-step-view">
                                                                    <div className="payment-summary-header"><h3>Card Payment: ${baggageFee}</h3></div>
                                                                    <div className="card-input-grid">
                                                                        <div className="full-width">
                                                                            <input type="text" placeholder="Cardholder Name" value={card.name || ""} onChange={(e) => handleCardChange(p.ticket_id, "name", e.target.value)} />
                                                                        </div>
                                                                        <div className="full-width">
                                                                            <input type="text" placeholder="Card Number" maxLength="16" value={card.number || ""} onChange={(e) => handleCardChange(p.ticket_id, "number", e.target.value)} />
                                                                        </div>
                                                                        <div><input type="text" placeholder="MM/YY" maxLength="5" value={card.expiry || ""} onChange={(e) => handleCardChange(p.ticket_id, "expiry", e.target.value)} /></div>
                                                                        <div><input type="password" placeholder="CVV" maxLength="4" value={card.cvv || ""} onChange={(e) => handleCardChange(p.ticket_id, "cvv", e.target.value)} /></div>
                                                                    </div>
                                                                    <div className="baggage-form-footer">
                                                                        <button className="btn-cancel" onClick={() => setPaymentSteps(prev => ({ ...prev, [p.ticket_id]: "input" }))} disabled={isProcessing}>Back</button>
                                                                        <button
                                                                            className="btn-apply-baggage"
                                                                            disabled={!isCardValid || isProcessing}
                                                                            onClick={() => handleFinalizePayment(p)}
                                                                        >
                                                                            {isProcessing ? "Processing..." : "Finalize Payment"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
