import { useState } from 'react';
//shift calendar is for managing schedule requests
import PilotPersonalInfo from '../pages/pilotPersonalInfo.jsx';
import PilotScheduledFlights from '../pages/pilotScheduledFlights.jsx';
import PilotShiftCalendar from '../pages/pilotShiftCalendar.jsx';
import PilotFlightReports from '../pages/pilotFlightReports.jsx';
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
        {page === 'shift' && <PilotShiftCalendar employeeId={employeeId} />}
        {page === 'flights' && <PilotScheduledFlights employeeId={employeeId} />}
        {page === 'personal' && <PilotPersonalInfo employeeId={employeeId} />}
        {page === 'reports' && <PilotFlightReports employeeId={employeeId} />}
      </main>
    </div>
  );
}

export default PilotDashboard;