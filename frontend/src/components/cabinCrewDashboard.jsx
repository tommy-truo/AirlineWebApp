import { useState } from 'react';
import CabinCrewShiftCalendar from '../pages/cabinCrewShiftCalendar.jsx';
import CabinCrewScheduledFlights from '../pages/cabinCrewScheduledFlights.jsx';
import CabinCrewPersonalInfo from '../pages/cabinCrewPersonalInfo.jsx';
import CabinCrewFlightReports from '../pages/cabinCrewFlightReports.jsx';
import './PilotDashboard.css';

function CabinCrewDashboard({ employeeId, onLogout }) {
  const [page, setPage] = useState('shift');

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">ACME Airlines</div>
          <p className="sidebar-subtitle">Cabin Crew Portal</p>

          <div className="sidebar-nav">
            <button
              className={page === 'shift' ? 'sidebar-button active' : 'sidebar-button'}
              onClick={() => setPage('shift')}
            >
              Shift Calendar
            </button>

            <button
              className={page === 'flights' ? 'sidebar-button active' : 'sidebar-button'}
              onClick={() => setPage('flights')}
            >
              Scheduled Flights
            </button>

            <button
              className={page === 'personal' ? 'sidebar-button active' : 'sidebar-button'}
              onClick={() => setPage('personal')}
            >
              Personal Info
            </button>

            <button
              className={page === 'reports' ? 'sidebar-button active' : 'sidebar-button'}
              onClick={() => setPage('reports')}
            >
              Flight Reports / Logs
            </button>
          </div>
        </div>

        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-content">
        {page === 'shift' && <CabinCrewShiftCalendar employeeId={employeeId} />}
        {page === 'flights' && <CabinCrewScheduledFlights employeeId={employeeId} />}
        {page === 'personal' && <CabinCrewPersonalInfo employeeId={employeeId} />}
        {page === 'reports' && <CabinCrewFlightReports employeeId={employeeId} />}
      </main>
    </div>
  );
}

export default CabinCrewDashboard;