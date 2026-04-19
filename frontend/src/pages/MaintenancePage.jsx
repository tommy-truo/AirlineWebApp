import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function toYMD(date) {
  return date.toISOString().split('T')[0];
}
function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toYMD(d);
}
function today() { return toYMD(new Date()); }

function exportCSV(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const tabStyle = (active) => ({
  padding: '10px 22px',
  borderRadius: '8px 8px 0 0',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.95rem',
  background: active ? '#c62828' : '#f0f0f0',
  color: active ? 'white' : '#555',
  marginRight: '4px',
  transition: 'all 0.2s',
});

const statusBadge = (status) => {
  const colors = { Active: '#2ecc71', Broken: '#e74c3c', Maintenance: '#e67e22' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
      background: colors[status] || '#999', color: 'white', fontSize: '12px', fontWeight: 600
    }}>{status}</span>
  );
};

function ServiceReportDoc({ logs, employeeName, dateFrom, dateTo }) {
  const grouped = logs.reduce((acc, l) => {
    const key = `${l.aircraft_name} (#${l.aircraft_id})`;
    if (!acc[key]) acc[key] = { location: l.airport_iata ? `${l.airport_iata} — ${l.airport_city}, ${l.airport_country}` : '—', rows: [] };
    acc[key].rows.push(l);
    return acc;
  }, {});
  const grandTotal = logs.reduce((s, l) => s + Number(l.hours_worked), 0);
  const grandEst   = logs.reduce((s, l) => s + Number(l.estimated_hours), 0);
  const grandVar   = grandTotal - grandEst;
  const fmt = (d) => new Date(d).toLocaleDateString();
  const cell = (extra = {}) => ({ border: '1px solid #ccc', padding: '6px 10px', fontSize: '13px', textAlign: 'left', ...extra });
  const thStyle = { ...cell(), background: '#d0d0d0', fontWeight: 700, fontSize: '12px' };

  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#222', padding: '32px', maxWidth: '960px', margin: '0 auto', background: 'white' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '3px solid #222', paddingBottom: '16px', marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.04em' }}>SERVICE ACTIVITY REPORT</div>
        <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>Maintenance Department — Airline Operations</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '24px', fontSize: '13px' }}>
        <div><strong>Employee:</strong> {employeeName || '—'}</div>
        <div><strong>Department:</strong> Maintenance</div>
        <div><strong>Report Period:</strong> {dateFrom} to {dateTo}</div>
        <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
        <div><strong>Total Logs:</strong> {logs.length}</div>
        <div><strong>Grand Total Hours:</strong> <span style={{ fontWeight: 700 }}>{grandTotal.toFixed(1)}h</span></div>
      </div>

      {Object.entries(grouped).map(([aircraft, { location, rows }]) => {
        const sub = rows.reduce((s, r) => s + Number(r.hours_worked), 0);
        const subEst = rows.reduce((s, r) => s + Number(r.estimated_hours), 0);
        const subVar = sub - subEst;
        return (
          <div key={aircraft} style={{ marginBottom: '28px' }}>
            <div style={{ background: '#888', color: 'white', padding: '7px 12px', fontWeight: 700, fontSize: '14px', borderRadius: '4px 4px 0 0' }}>
              {aircraft} &nbsp;•&nbsp; {location}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Log ID</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Task Description</th>
                  <th style={thStyle}>Priority</th>
                  <th style={thStyle}>Est. Hrs</th>
                  <th style={thStyle}>Worked</th>
                  <th style={thStyle}>Variance</th>
                  <th style={thStyle}>Parts Replaced</th>
                  <th style={thStyle}>Service Performed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.log_id} style={{ background: idx % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <td style={cell({ textAlign: 'center' })}>{r.log_id}</td>
                    <td style={cell()}>{fmt(r.submitted_datetime)}</td>
                    <td style={cell()}>{r.task_description}</td>
                    <td style={cell({ textAlign: 'center' })}>{r.priority || 'Routine'}</td>
                    <td style={cell({ textAlign: 'center' })}>{r.estimated_hours}h</td>
                    <td style={cell({ textAlign: 'center', fontWeight: 600 })}>{r.hours_worked}h</td>
                    <td style={cell({ textAlign: 'center', fontWeight: 600, color: Number(r.hours_variance) > 0 ? '#c0392b' : '#27ae60' })}>
                      {Number(r.hours_variance) > 0 ? '+' : ''}{Number(r.hours_variance).toFixed(1)}h
                    </td>
                    <td style={cell()}>{r.parts_replaced || '—'}</td>
                    <td style={cell()}>{r.service_performed}</td>
                  </tr>
                ))}
                <tr style={{ background: '#e8e8e8' }}>
                  <td colSpan={5} style={cell({ textAlign: 'right', fontWeight: 700 })}>Aircraft Subtotal</td>
                  <td style={cell({ textAlign: 'center', fontWeight: 700 })}>{sub.toFixed(1)}h</td>
                  <td style={cell({ textAlign: 'center', fontWeight: 700, color: subVar > 0 ? '#c0392b' : '#27ae60' })}>
                    {subVar > 0 ? '+' : ''}{subVar.toFixed(1)}h
                  </td>
                  <td colSpan={2} style={cell()} />
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Grand Total */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
        <tbody>
          <tr style={{ background: '#333', color: 'white' }}>
            <td style={{ ...cell(), fontWeight: 700, fontSize: '14px' }} colSpan={5}>GRAND TOTAL</td>
            <td style={{ ...cell(), textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>{grandTotal.toFixed(1)}h</td>
            <td style={{ ...cell(), textAlign: 'center', fontWeight: 700, fontSize: '14px', color: grandVar > 0 ? '#ff8a80' : '#a5d6a7' }}>
              {grandVar > 0 ? '+' : ''}{grandVar.toFixed(1)}h
            </td>
            <td colSpan={2} style={cell({ background: '#333' })} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function BarChart({ title, data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ marginBottom: '24px', background: '#f9f9f9', borderRadius: '10px', padding: '16px 20px' }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#444', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
      {data.map(d => (
        <div key={d.label} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <span style={{ width: '150px', fontSize: '13px', textAlign: 'right', color: '#555', flexShrink: 0 }}>{d.label}</span>
          <div style={{ flex: 1, background: '#e8e8e8', borderRadius: '4px', height: '22px', overflow: 'hidden' }}>
            <div style={{
              width: `${(d.value / max) * 100}%`, background: d.color,
              height: '100%', borderRadius: '4px',
              minWidth: d.value > 0 ? '6px' : '0',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <span style={{ width: '45px', fontSize: '13px', fontWeight: 700, color: '#333' }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

const dateInputStyle = {
  padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc',
  fontSize: '14px', marginLeft: '6px'
};
const labelStyle = { fontSize: '13px', fontWeight: 600, color: '#555' };

export default function MaintenancePage({ employeeId = 1 }) {
  const [tab, setTab] = useState('aircraft');
  const [aircraft, setAircraft] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [issues, setIssues] = useState([]);
  const [summary, setSummary] = useState(null);
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const [logDateRange, setLogDateRange] = useState({ from: defaultFrom(), to: today() });
  const [issueDateRange, setIssueDateRange] = useState({ from: defaultFrom(), to: today() });
  const [logReportView, setLogReportView] = useState(false);

  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [logForm, setLogForm] = useState({ hours_worked: '', service_performed: '' });

  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueForm, setIssueForm] = useState({ log_id: '', aircraft_id: '', issue_description: '' });

  function showSuccess(msg) { setActionMsg(msg); setActionError(''); setTimeout(() => setActionMsg(''), 4000); }
  function showError(msg) { setActionError(msg); setActionMsg(''); setTimeout(() => setActionError(''), 4000); }

  async function fetchLogs(from, to) {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams({ employee_id: employeeId });
      if (from) params.set('start_date', from);
      if (to)   params.set('end_date', to);
      const r = await fetch(`${API}/api/maintenance/logs?${params}`);
      const data = await r.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch { showError('Failed to load service logs.'); }
    finally { setLogsLoading(false); }
  }

  async function fetchIssues(from, to) {
    setIssuesLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('start_date', from);
      if (to)   params.set('end_date', to);
      const r = await fetch(`${API}/api/maintenance/issues?${params}`);
      const data = await r.json();
      setIssues(Array.isArray(data) ? data : []);
    } catch { showError('Failed to load issues.'); }
    finally { setIssuesLoading(false); }
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const [aR, tR, sR] = await Promise.all([
        fetch(`${API}/api/maintenance/aircraft`),
        fetch(`${API}/api/maintenance/tasks?employee_id=${employeeId}`),
        fetch(`${API}/api/maintenance/summary?employee_id=${employeeId}`),
      ]);
      const [a, t, s] = await Promise.all([aR.json(), tR.json(), sR.json()]);
      setAircraft(Array.isArray(a) ? a : []);
      setTasks(Array.isArray(t) ? t : []);
      setSummary(s);
      if (Array.isArray(t) && t.length > 0) setEmployeeName(t[0].assigned_employee || '');
    } catch { showError('Failed to load data.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    fetchAll();
    fetchLogs(logDateRange.from, logDateRange.to);
    fetchIssues(issueDateRange.from, issueDateRange.to);
  }, [employeeId]);

  async function handleAircraftAction(id, action) {
    try {
      const res = await fetch(`${API}/api/maintenance/aircraft/${id}/${action}`, { method: 'PUT' });
      const data = await res.json();
      if (res.ok) { showSuccess(data.message); fetchAll(); } else showError(data.message);
    } catch { showError('Action failed.'); }
  }

  async function handleCompleteTask(taskId) {
    try {
      const res = await fetch(`${API}/api/maintenance/tasks/${taskId}/complete`, { method: 'PUT' });
      const data = await res.json();
      if (res.ok) { showSuccess(data.message); fetchAll(); } else showError(data.message);
    } catch { showError('Action failed.'); }
  }

  async function handleSubmitLog(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/maintenance/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: selectedTask.task_id,
          employee_id: employeeId,
          aircraft_id: selectedTask.aircraft_id,
          hours_worked: logForm.hours_worked,
          service_performed: logForm.service_performed
        })
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('Service log submitted.');
        setShowLogForm(false);
        fetchLogs(logDateRange.from, logDateRange.to);
      } else showError(data.message);
    } catch { showError('Failed to submit log.'); }
  }

  async function handleSubmitIssue(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/maintenance/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueForm)
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('Issue reported.');
        setShowIssueForm(false);
        setIssueForm({ log_id: '', aircraft_id: '', issue_description: '' });
        fetchIssues(issueDateRange.from, issueDateRange.to);
      } else showError(data.message);
    } catch { showError('Failed to report issue.'); }
  }

  const pendingTasks = tasks.filter(t => !t.is_complete);
  const completedTasks = tasks.filter(t => t.is_complete);

  // Bar chart data derived from current filtered results
  const hoursByAircraft = Object.values(
    logs.reduce((acc, l) => {
      const key = l.aircraft_name || `Aircraft #${l.aircraft_id}`;
      acc[key] = acc[key] || { label: key, value: 0, color: '#3498db' };
      acc[key].value = parseFloat((acc[key].value + Number(l.hours_worked)).toFixed(1));
      return acc;
    }, {})
  );

  const severityCounts = ['Critical', 'High', 'Medium', 'Low'].map(s => ({
    label: s,
    value: issues.filter(i => i.severity === s).length,
    color: s === 'Critical' ? '#e74c3c' : s === 'High' ? '#e67e22' : s === 'Medium' ? '#f39c12' : '#3498db'
  }));

  const safetyCriticalCount = issues.filter(i => i.safety_critical).length;
  const resolvedCount = issues.filter(i => i.resolved).length;

  return (
    <div className="page">
      <h2 style={{ textAlign: 'center', marginBottom: '6px', color: '#777' }}>Maintenance Crew Dashboard</h2>
      <h1 className="title" style={{ marginBottom: '4px' }}>{employeeName || 'Maintenance Crew'}</h1>
      <p style={{ textAlign: 'center', color: '#999', fontSize: '16px', marginTop: 0, marginBottom: '24px' }}>
        Maintenance • Service Management
      </p>

      {actionMsg && <p style={{ color: 'green', textAlign: 'center', fontWeight: 600, marginBottom: '12px' }}>{actionMsg}</p>}
      {actionError && <p style={{ color: 'red', textAlign: 'center', fontWeight: 600, marginBottom: '12px' }}>{actionError}</p>}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card"><h3>Aircraft in Service</h3><p>{loading ? '—' : aircraft.length}</p></div>
        <div className="summary-card"><h3>Pending Tasks</h3><p>{loading ? '—' : pendingTasks.length}</p></div>
        <div className="summary-card"><h3>Completed Tasks</h3><p>{loading ? '—' : completedTasks.length}</p></div>
        <div className="summary-card"><h3>Issues Reported</h3><p>{loading ? '—' : issues.length}</p></div>
      </div>

      {/* Tab Bar */}
      <div style={{ borderBottom: '2px solid #c62828', marginBottom: '0' }}>
        {[
          { key: 'aircraft', label: 'Aircraft' },
          { key: 'tasks',    label: `Tasks (${pendingTasks.length} pending)` },
          { key: 'logs',     label: 'Service Report' },
          { key: 'issues',   label: 'Issues Report' },
        ].map(t => (
          <button key={t.key} style={tabStyle(tab === t.key)} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '0 0 16px 16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>

        {/* AIRCRAFT TAB */}
        {tab === 'aircraft' && (
          <div>
            <h3 style={{ marginTop: 0, color: '#c62828' }}>Aircraft in Service</h3>
            <table className="shift-table">
              <thead>
                <tr>
                  <th>Aircraft ID</th><th>Name</th><th>Status</th>
                  <th>First Class</th><th>Economy</th>
                  <th>Fuel</th><th>Baggage Cap.</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {aircraft.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#888' }}>No aircraft currently in service.</td></tr>
                  : aircraft.map(a => (
                    <tr key={a.aircraft_id}>
                      <td>{a.aircraft_id}</td>
                      <td>{a.aircraft_name}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td>{a.first_class_seat_count}</td>
                      <td>{a.economy_seat_count}</td>
                      <td>{a.fuel_amount?.toLocaleString()} / {a.fuel_capacity?.toLocaleString()} L</td>
                      <td>{a.baggage_capacity?.toLocaleString()} kg</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button className="action-button" style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none' }}
                            onClick={() => handleAircraftAction(a.aircraft_id, 'mark-active')}>Mark Active</button>
                          <button className="action-button" style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none' }}
                            onClick={() => handleAircraftAction(a.aircraft_id, 'mark-broken')}>Mark Broken</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <div>
            <h3 style={{ marginTop: 0, color: '#c62828' }}>Upcoming Tasks</h3>
            <table className="shift-table">
              <thead>
                <tr>
                  <th>Task ID</th><th>Aircraft</th><th>Location</th><th>Priority</th>
                  <th>Description</th><th>Est. Hours</th><th>Scheduled</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0
                  ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#888' }}>No tasks assigned.</td></tr>
                  : tasks.map(t => (
                    <tr key={t.task_id}>
                      <td>{t.task_id}</td>
                      <td>{t.aircraft_name} (#{t.aircraft_id})</td>
                      <td>{t.airport_iata ? `${t.airport_iata} — ${t.airport_city}` : '—'}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: 'white',
                          background: t.priority === 'Critical' ? '#e74c3c' : t.priority === 'Urgent' ? '#e67e22' : '#3498db'
                        }}>{t.priority || 'Routine'}</span>
                      </td>
                      <td style={{ textAlign: 'left' }}>{t.task_description}</td>
                      <td>{t.estimated_hours}h</td>
                      <td>{new Date(t.scheduled_date).toLocaleDateString()}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: 'white',
                          background: t.is_complete ? '#2ecc71' : '#f39c12'
                        }}>{t.is_complete ? 'Complete' : 'Pending'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {!t.is_complete && (
                            <button className="action-button" style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none' }}
                              onClick={() => handleCompleteTask(t.task_id)}>Mark Complete</button>
                          )}
                          <button className="action-button" style={{ backgroundColor: '#3498db', color: 'white', border: 'none' }}
                            onClick={() => { setSelectedTask(t); setLogForm({ hours_worked: '', service_performed: '' }); setShowLogForm(true); }}>
                            Log Service
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {showLogForm && selectedTask && (
              <form onSubmit={handleSubmitLog} style={{ marginTop: '24px', background: '#f9f9f9', padding: '24px', borderRadius: '12px', border: '1px solid #eee' }}>
                <h3 style={{ marginTop: 0 }}>Log Service — {selectedTask.aircraft_name} (Task #{selectedTask.task_id})</h3>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Hours Worked</label>
                  <input type="number" step="0.25" min="0.25" required value={logForm.hours_worked}
                    onChange={e => setLogForm(f => ({ ...f, hours_worked: e.target.value }))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Service Performed</label>
                  <textarea required rows={4} value={logForm.service_performed}
                    onChange={e => setLogForm(f => ({ ...f, service_performed: e.target.value }))}
                    placeholder="Describe the work performed..."
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="action-button">Submit Log</button>
                  <button type="button" className="action-button" onClick={() => setShowLogForm(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* SERVICE REPORT TAB */}
        {tab === 'logs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, color: '#c62828' }}>Service Report</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="action-button"
                  style={{ backgroundColor: logReportView ? '#555' : '#3498db', color: 'white', border: 'none' }}
                  onClick={() => setLogReportView(v => !v)}>
                  {logReportView ? 'Table View' : 'Report View'}
                </button>
                <button className="action-button" style={{ backgroundColor: '#27ae60', color: 'white', border: 'none' }}
                  onClick={() => exportCSV(logs, `service_report_${logDateRange.from}_to_${logDateRange.to}.csv`)}>Export CSV</button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', background: '#f5f5f5', padding: '14px 18px', borderRadius: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: '#444', fontSize: '14px' }}>Date Range</span>
              <label style={labelStyle}>From
                <input type="date" value={logDateRange.from}
                  onChange={e => setLogDateRange(r => ({ ...r, from: e.target.value }))}
                  style={dateInputStyle} />
              </label>
              <label style={labelStyle}>To
                <input type="date" value={logDateRange.to}
                  onChange={e => setLogDateRange(r => ({ ...r, to: e.target.value }))}
                  style={dateInputStyle} />
              </label>
              <button className="action-button" style={{ backgroundColor: '#c62828', color: 'white', border: 'none' }}
                onClick={() => fetchLogs(logDateRange.from, logDateRange.to)}>
                Generate Report
              </button>
            </div>

            {/* KPI Cards */}
            {summary && (
              <div className="summary-cards" style={{ marginBottom: '20px' }}>
                <div className="summary-card"><h3>Total Logs</h3><p>{logs.length}</p></div>
                <div className="summary-card">
                  <h3>Total Hours</h3>
                  <p>{logs.reduce((s, l) => s + Number(l.hours_worked), 0).toFixed(1)}h</p>
                </div>
                <div className="summary-card">
                  <h3>Avg Hrs / Log</h3>
                  <p>{logs.length ? (logs.reduce((s, l) => s + Number(l.hours_worked), 0) / logs.length).toFixed(1) : 0}h</p>
                </div>
                <div className="summary-card">
                  <h3>Hours Variance</h3>
                  <p style={{ color: logs.reduce((s, l) => s + (Number(l.hours_worked) - Number(l.estimated_hours)), 0) > 0 ? '#e74c3c' : '#2ecc71' }}>
                    {(() => { const v = logs.reduce((s, l) => s + (Number(l.hours_worked) - Number(l.estimated_hours)), 0); return (v > 0 ? '+' : '') + v.toFixed(1) + 'h'; })()}
                  </p>
                </div>
              </div>
            )}

            {/* Bar Chart */}
            {hoursByAircraft.length > 0 && (
              <BarChart title="Hours Worked by Aircraft" data={hoursByAircraft} />
            )}

            {logReportView
              ? <ServiceReportDoc logs={logs} employeeName={employeeName} dateFrom={logDateRange.from} dateTo={logDateRange.to} />
              : logsLoading
              ? <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>
              : (
              <table className="shift-table">
                <thead>
                  <tr>
                    <th>Log ID</th><th>Submitted</th><th>Aircraft</th><th>Status</th>
                    <th>Location</th><th>Priority</th><th>Employee</th><th>Job Title</th>
                    <th>Task</th><th>Est. Hrs</th><th>Worked</th><th>Variance</th>
                    <th>Parts Replaced</th><th>Service Performed</th><th>Complete</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0
                    ? <tr><td colSpan={16} style={{ textAlign: 'center', color: '#888' }}>No service logs in this date range.</td></tr>
                    : logs.map(l => (
                      <tr key={l.log_id}>
                        <td>{l.log_id}</td>
                        <td>{new Date(l.submitted_datetime).toLocaleString()}</td>
                        <td>{l.aircraft_name} (#{l.aircraft_id})</td>
                        <td>{statusBadge(l.aircraft_current_status)}</td>
                        <td>{l.airport_iata ? `${l.airport_iata} — ${l.airport_city}, ${l.airport_country}` : '—'}</td>
                        <td>
                          <span style={{
                            display: 'inline-block', padding: '3px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: 'white',
                            background: l.priority === 'Critical' ? '#e74c3c' : l.priority === 'Urgent' ? '#e67e22' : '#3498db'
                          }}>{l.priority || 'Routine'}</span>
                        </td>
                        <td>{l.employee_name}</td>
                        <td>{l.job_title}</td>
                        <td style={{ textAlign: 'left', maxWidth: '160px' }}>{l.task_description}</td>
                        <td>{l.estimated_hours}h</td>
                        <td>{l.hours_worked}h</td>
                        <td style={{ fontWeight: 600, color: Number(l.hours_variance) > 0 ? '#e74c3c' : '#2ecc71' }}>
                          {Number(l.hours_variance) > 0 ? '+' : ''}{Number(l.hours_variance).toFixed(2)}h
                        </td>
                        <td style={{ textAlign: 'left', maxWidth: '160px' }}>{l.parts_replaced || '—'}</td>
                        <td style={{ textAlign: 'left', maxWidth: '180px' }}>{l.service_performed}</td>
                        <td>
                          <span style={{
                            display: 'inline-block', padding: '3px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: 'white',
                            background: l.is_complete ? '#2ecc71' : '#f39c12'
                          }}>{l.is_complete ? 'Yes' : 'No'}</span>
                        </td>
                        <td>
                          <button className="action-button" style={{ backgroundColor: '#e67e22', color: 'white', border: 'none' }}
                            onClick={() => { setIssueForm({ log_id: l.log_id, aircraft_id: l.aircraft_id, issue_description: '' }); setShowIssueForm(true); setTab('issues'); }}>
                            Report Issue
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ISSUES REPORT TAB */}
        {tab === 'issues' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, color: '#c62828' }}>Issues Report</h3>
              <button className="action-button" style={{ backgroundColor: '#27ae60', color: 'white', border: 'none' }}
                onClick={() => exportCSV(issues, `issues_report_${issueDateRange.from}_to_${issueDateRange.to}.csv`)}>Export CSV</button>
            </div>

            {/* Date Range Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', background: '#f5f5f5', padding: '14px 18px', borderRadius: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: '#444', fontSize: '14px' }}>Date Range</span>
              <label style={labelStyle}>From
                <input type="date" value={issueDateRange.from}
                  onChange={e => setIssueDateRange(r => ({ ...r, from: e.target.value }))}
                  style={dateInputStyle} />
              </label>
              <label style={labelStyle}>To
                <input type="date" value={issueDateRange.to}
                  onChange={e => setIssueDateRange(r => ({ ...r, to: e.target.value }))}
                  style={dateInputStyle} />
              </label>
              <button className="action-button" style={{ backgroundColor: '#c62828', color: 'white', border: 'none' }}
                onClick={() => fetchIssues(issueDateRange.from, issueDateRange.to)}>
                Generate Report
              </button>
            </div>

            {/* KPI Cards */}
            <div className="summary-cards" style={{ marginBottom: '20px' }}>
              <div className="summary-card"><h3>Total Issues</h3><p>{issues.length}</p></div>
              <div className="summary-card">
                <h3>Safety Critical</h3>
                <p style={{ color: safetyCriticalCount > 0 ? '#e74c3c' : '#2ecc71' }}>{safetyCriticalCount}</p>
              </div>
              <div className="summary-card">
                <h3>Resolved</h3>
                <p style={{ color: '#2ecc71' }}>{resolvedCount}</p>
              </div>
              <div className="summary-card">
                <h3>Open</h3>
                <p style={{ color: issues.length - resolvedCount > 0 ? '#e67e22' : '#2ecc71' }}>{issues.length - resolvedCount}</p>
              </div>
            </div>

            {/* Bar Chart */}
            {issues.length > 0 && (
              <BarChart title="Issues by Severity" data={severityCounts} />
            )}

            {showIssueForm && (
              <form onSubmit={handleSubmitIssue} style={{ marginBottom: '24px', background: '#f9f9f9', padding: '24px', borderRadius: '12px', border: '1px solid #eee' }}>
                <h3 style={{ marginTop: 0 }}>Report Additional Issue — Log #{issueForm.log_id}</h3>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Issue Description</label>
                  <textarea required rows={4} value={issueForm.issue_description}
                    onChange={e => setIssueForm(f => ({ ...f, issue_description: e.target.value }))}
                    placeholder="Describe the additional issue found..."
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="action-button">Submit Issue</button>
                  <button type="button" className="action-button" onClick={() => setShowIssueForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            {issuesLoading
              ? <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>
              : (
              <table className="shift-table">
                <thead>
                  <tr>
                    <th>Issue ID</th><th>Reported</th><th>Aircraft</th><th>Status</th>
                    <th>Location</th><th>Severity</th><th>Safety Critical</th><th>Resolved</th>
                    <th>Reported By</th><th>Job Title</th><th>Related Task</th>
                    <th>Linked Log</th><th>Issue Description</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.length === 0
                    ? <tr><td colSpan={13} style={{ textAlign: 'center', color: '#888' }}>No issues in this date range.</td></tr>
                    : issues.map(i => (
                      <tr key={i.issue_id}>
                        <td>{i.issue_id}</td>
                        <td>{new Date(i.reported_datetime).toLocaleString()}</td>
                        <td>{i.aircraft_name} (#{i.aircraft_id})</td>
                        <td>{statusBadge(i.aircraft_current_status)}</td>
                        <td>{i.airport_iata ? `${i.airport_iata} — ${i.airport_city}, ${i.airport_country}` : '—'}</td>
                        <td>
                          <span style={{
                            display: 'inline-block', padding: '3px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: 'white',
                            background: i.severity === 'Critical' ? '#e74c3c' : i.severity === 'High' ? '#e67e22' : i.severity === 'Medium' ? '#f39c12' : '#3498db'
                          }}>{i.severity || '—'}</span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block', padding: '3px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: 'white',
                            background: i.safety_critical ? '#e74c3c' : '#2ecc71'
                          }}>{i.safety_critical ? 'YES' : 'No'}</span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block', padding: '3px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: 'white',
                            background: i.resolved ? '#2ecc71' : '#e74c3c'
                          }}>{i.resolved ? 'Yes' : 'Open'}</span>
                        </td>
                        <td>{i.reported_by}</td>
                        <td>{i.job_title}</td>
                        <td style={{ textAlign: 'left', maxWidth: '160px' }}>{i.related_task}</td>
                        <td>Log #{i.log_id}</td>
                        <td style={{ textAlign: 'left', maxWidth: '220px' }}>{i.issue_description}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
