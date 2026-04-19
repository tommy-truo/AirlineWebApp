import { useState } from 'react';
import MaintenancePage from '../pages/MaintenancePage.jsx';
import ShiftCalendar from '../pages/pilotShiftCalendar.jsx';
import PersonalInfo from '../pages/pilotPersonalInfo.jsx';
import './PilotDashboard.css';

function MaintenanceDashboard({ employeeId, onLogout }) {
  const [page, setPage] = useState('maintenance');

  return (
    <div>
      <div className="navbar">ACME Airlines
        <button
          onClick={onLogout}
          style={{
            float: 'right',
            backgroundColor: '#e53935',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div className="nav-buttons">
        <button
          className={page === 'maintenance' ? 'active' : ''}
          onClick={() => setPage('maintenance')}
        >
          Maintenance
        </button>

        <button
          className={page === 'shift' ? 'active' : ''}
          onClick={() => setPage('shift')}
        >
          Shift Calendar
        </button>

        <button
          className={page === 'personal' ? 'active' : ''}
          onClick={() => setPage('personal')}
        >
          Personal Info
        </button>
      </div>

      <div className="page-container">
        {page === 'maintenance' && <MaintenancePage employeeId={employeeId} />}
        {page === 'shift' && <ShiftCalendar employeeId={employeeId} />}
        {page === 'personal' && <PersonalInfo employeeId={employeeId} />}
      </div>
    </div>
  );
}

export default MaintenanceDashboard;
