import { useState } from 'react';
import ShiftCalendar from '../pages/shiftCalendar.jsx';
import ScheduledFlights from '../pages/scheduledFlights.jsx';
import PersonalInfo from '../pages/personalInfo.jsx';
import FlightReports from '../pages/flightReports.jsx';
import './PilotDashboard.css';

function PilotDashboard({ employeeId, onLogout }) {
  const [page, setPage] = useState('shift');

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">ACME Airlines</div>
          <p className="sidebar-subtitle">Pilot Portal</p>

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
        {page === 'shift' && <ShiftCalendar employeeId={employeeId} />}
        {page === 'flights' && <ScheduledFlights employeeId={employeeId} />}
        {page === 'personal' && <PersonalInfo employeeId={employeeId} />}

    
        {page === 'reports' && (
          <div className="page">
            <h1 className="title">Flight Reports / Logs</h1>
            <p style={{ textAlign: 'center', color: '#777' }}>
              Flight reports page coming next.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default PilotDashboard;