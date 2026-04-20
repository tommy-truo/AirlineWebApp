import { useState } from 'react';
import MaintenancePage from '../pages/MaintenancePage.jsx';
import ShiftCalendar from '../pages/pilotShiftCalendar.jsx';
import PersonalInfo from '../pages/pilotPersonalInfo.jsx';
import './PilotDashboard.css';

function MaintenanceDashboard({ employeeId, onLogout }) {
  const [page, setPage] = useState('maintenance');

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">ACME Airlines</div>
          <p className="sidebar-subtitle">Maintenance Portal</p>

          <div className="sidebar-nav">
            <button
              className={page === 'maintenance' ? 'sidebar-button active' : 'sidebar-button'}
              onClick={() => setPage('maintenance')}
            >
              Maintenance
            </button>

            <button
              className={page === 'shift' ? 'sidebar-button active' : 'sidebar-button'}
              onClick={() => setPage('shift')}
            >
              Shift Calendar
            </button>

            <button
              className={page === 'personal' ? 'sidebar-button active' : 'sidebar-button'}
              onClick={() => setPage('personal')}
            >
              Personal Info
            </button>
          </div>
        </div>

        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-content">
        {page === 'maintenance' && <MaintenancePage employeeId={employeeId} />}
        {page === 'shift' && <ShiftCalendar employeeId={employeeId} />}
        {page === 'personal' && <PersonalInfo employeeId={employeeId} />}
      </main>
    </div>
  );
}

export default MaintenanceDashboard;
