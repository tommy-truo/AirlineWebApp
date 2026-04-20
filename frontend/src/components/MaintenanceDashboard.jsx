import { useState } from 'react';
import MaintenancePage from '../pages/MaintenancePage.jsx';
import ShiftCalendar from '../pages/pilotShiftCalendar.jsx';
import PersonalInfo from '../pages/pilotPersonalInfo.jsx';
import './PilotDashboard.css';

function MaintenanceDashboard({ employeeId, onLogout }) {
  const [page, setPage] = useState('maintenance');

  return (
    <div className="portal-dashboard-layout">
      <aside className="portal-sidebar">
        <div>
          <div className="portal-sidebar-logo">ACME Airlines</div>
          <p className="portal-sidebar-subtitle">Maintenance Portal</p>

          <div className="portal-sidebar-nav">
            <button
              className={page === 'maintenance' ? 'portal-sidebar-button active' : 'portal-sidebar-button'}
              onClick={() => setPage('maintenance')}
            >
              Maintenance
            </button>

            <button
              className={page === 'shift' ? 'portal-sidebar-button active' : 'portal-sidebar-button'}
              onClick={() => setPage('shift')}
            >
              Shift Calendar
            </button>

            <button
              className={page === 'personal' ? 'portal-sidebar-button active' : 'portal-sidebar-button'}
              onClick={() => setPage('personal')}
            >
              Personal Info
            </button>
          </div>
        </div>

        <button className="portal-logout-button" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="portal-dashboard-content">
        {page === 'maintenance' && <MaintenancePage employeeId={employeeId} />}
        {page === 'shift' && <ShiftCalendar employeeId={employeeId} />}
        {page === 'personal' && <PersonalInfo employeeId={employeeId} />}
      </main>
    </div>
  );
}

export default MaintenanceDashboard;
