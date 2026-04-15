import { useState } from 'react';
import ShiftCalendar from '../pages/shiftCalendar.jsx';
import ScheduledFlights from '../pages/scheduledFlights.jsx';
import PersonalInfo from '../pages/personalInfo.jsx';
import './PilotDashboard.css';

function PilotDashboard({ employeeId, onLogout }) {
  const [page, setPage] = useState('shift');

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
          className={page === 'shift' ? 'active' : ''}
          onClick={() => setPage('shift')}
        >
          Shift Calendar
        </button>

        <button
          className={page === 'flights' ? 'active' : ''}
          onClick={() => setPage('flights')}
        >
          Scheduled Flights
        </button>

        <button
          className={page === 'personal' ? 'active' : ''}
          onClick={() => setPage('personal')}
        >
          Personal Info
        </button>
      </div>

      <div className="page-container">
        {page === 'shift' && <ShiftCalendar employeeId={employeeId} />}
        {page === 'flights' && <ScheduledFlights employeeId={employeeId} />}
        {page === 'personal' && <PersonalInfo employeeId={employeeId} />}
      </div>
    </div>
  );
}

export default PilotDashboard;