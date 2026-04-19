import { useState } from 'react';
import PilotPersonalInfo from '../pages/pilotPersonalInfo.jsx';
import PilotScheduledFlights from '../pages/pilotScheduledFlights.jsx';
import PilotShiftCalendar from '../pages/pilotShiftCalendar.jsx';
import PilotFlightReports from '../pages/pilotFlightReports.jsx';
import './PilotDashboard.css';

function PilotDashboard({ employeeId, onLogout }) {
  const [page, setPage] = useState('shift');

  return (
    <div className="portal-dashboard-layout">
      <aside className="portal-sidebar">
        <div>
          <div className="portal-sidebar-logo">ACME Airlines</div>
          <p className="portal-sidebar-subtitle">Pilot Portal</p>

          <div className="portal-sidebar-nav">
            <button
              className={
                page === 'shift'
                  ? 'portal-sidebar-button active'
                  : 'portal-sidebar-button'
              }
              onClick={() => setPage('shift')}
            >
              Shift Calendar
            </button>

            <button
              className={
                page === 'flights'
                  ? 'portal-sidebar-button active'
                  : 'portal-sidebar-button'
              }
              onClick={() => setPage('flights')}
            >
              Scheduled Flights
            </button>

            <button
              className={
                page === 'personal'
                  ? 'portal-sidebar-button active'
                  : 'portal-sidebar-button'
              }
              onClick={() => setPage('personal')}
            >
              Personal Info
            </button>

            <button
              className={
                page === 'reports'
                  ? 'portal-sidebar-button active'
                  : 'portal-sidebar-button'
              }
              onClick={() => setPage('reports')}
            >
              Flight Reports / Logs
            </button>
          </div>
        </div>

        <button className="portal-logout-button" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="portal-dashboard-content">
        {page === 'shift' && <PilotShiftCalendar employeeId={employeeId} />}
        {page === 'flights' && <PilotScheduledFlights employeeId={employeeId} />}
        {page === 'personal' && <PilotPersonalInfo employeeId={employeeId} />}
        {page === 'reports' && <PilotFlightReports employeeId={employeeId} />}
      </main>
    </div>
  );
}

export default PilotDashboard;