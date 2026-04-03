import { useState } from 'react';
import ShiftCalendar from '../pages/shiftCalendar.jsx';
import ScheduledFlights from '../pages/scheduledFlights.jsx';
import PersonalInfo from '../pages/personalInfo.jsx';
import './PilotDashboard.css';

function PilotDashboard({ employeeId, onLogout }) {
  const [page, setPage] = useState('shift');

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <h2 className="logo">ACME Airlines</h2>

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

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="main-content">
        {page === 'shift' && <ShiftCalendar employeeId={employeeId} />}
        {page === 'flights' && <ScheduledFlights employeeId={employeeId} />}
        {page === 'personal' && <PersonalInfo employeeId={employeeId} />}
      </div>
    </div>
  );
}

export default PilotDashboard;