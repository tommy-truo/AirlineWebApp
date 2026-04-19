import { useState } from 'react';
import CabinCrewShiftCalendar from '../pages/cabinCrewShiftCalendar.jsx';
import CabinCrewScheduledFlights from '../pages/cabinCrewScheduledFlights.jsx';
import CabinCrewPersonalInfo from '../pages/cabinCrewPersonalInfo.jsx';
import CabinCrewFlightReports from '../pages/cabinCrewFlightReports.jsx';
import './PilotDashboard.css';

function CabinCrewDashboard({ employeeId, onLogout }) {
  const [page, setPage] = useState('shift');

  return (
    <div className="portal-dashboard-layout">
      <aside className="portal-sidebar">
        <div>
          <div className="portal-sidebar-logo">ACME Airlines</div>
          <p className="portal-sidebar-subtitle">Cabin Crew Portal</p>

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
        {page === 'shift' && <CabinCrewShiftCalendar employeeId={employeeId} />}
        {page === 'flights' && <CabinCrewScheduledFlights employeeId={employeeId} />}
        {page === 'personal' && <CabinCrewPersonalInfo employeeId={employeeId} />}
        {page === 'reports' && <CabinCrewFlightReports employeeId={employeeId} />}
      </main>
    </div>
  );
}

export default CabinCrewDashboard;