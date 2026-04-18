import { pool } from '../db.js';

// GET /api/maintenance/aircraft
export async function getAircraftInMaintenance(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT a.aircraft_id, a.aircraft_name, s.status_name AS status,
        a.first_class_seat_count, a.economy_seat_count,
        a.baggage_capacity, a.fuel_amount, a.fuel_capacity
      FROM airline.aircrafts a
      JOIN airline.aircraft_statuses s ON a.aircraft_status_id = s.aircraft_status_id
      WHERE s.status_name IN ('Maintenance', 'Broken')
      ORDER BY a.aircraft_id
    `);
    res.status(200).json(rows);
  } catch (err) { next(err); }
}

// PUT /api/maintenance/aircraft/:id/begin-service
export async function beginService(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid aircraft_id' });
    const [result] = await pool.query(
      `UPDATE airline.aircrafts SET aircraft_status_id = 2 WHERE aircraft_id = ?`, [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Aircraft not found' });
    res.status(200).json({ message: 'Aircraft status set to Maintenance' });
  } catch (err) { next(err); }
}

// PUT /api/maintenance/aircraft/:id/mark-broken
export async function markBroken(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid aircraft_id' });
    const [result] = await pool.query(
      `UPDATE airline.aircrafts SET aircraft_status_id = 3 WHERE aircraft_id = ?`, [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Aircraft not found' });
    res.status(200).json({ message: "Aircraft marked Broken. Today's scheduled flights have been cancelled." });
  } catch (err) { next(err); }
}

// PUT /api/maintenance/aircraft/:id/mark-active
export async function markActive(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid aircraft_id' });
    const [result] = await pool.query(
      `UPDATE airline.aircrafts SET aircraft_status_id = 1 WHERE aircraft_id = ?`, [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Aircraft not found' });
    res.status(200).json({ message: 'Aircraft returned to Active status' });
  } catch (err) { next(err); }
}

// GET /api/maintenance/tasks?employee_id=
export async function getTasks(req, res, next) {
  try {
    const employeeId = req.query.employee_id ? Number(req.query.employee_id) : null;
    let sql = `
      SELECT st.task_id, st.aircraft_id, a.aircraft_name,
        st.assigned_employee_id,
        CONCAT(e.first_name, ' ', e.last_name) AS assigned_employee,
        st.task_description, st.estimated_hours, st.priority,
        ap.iata AS airport_iata, ap.city AS airport_city, ap.country AS airport_country,
        st.scheduled_date, st.is_complete, st.completed_datetime
      FROM airline.service_tasks st
      JOIN airline.aircrafts a ON st.aircraft_id = a.aircraft_id
      JOIN airline.employees e ON st.assigned_employee_id = e.employee_id
      LEFT JOIN airline.airports ap ON st.airport_id = ap.airport_id
    `;
    const params = [];
    if (employeeId) {
      sql += ` WHERE st.assigned_employee_id = ?`;
      params.push(employeeId);
    }
    sql += ` ORDER BY st.is_complete ASC, st.scheduled_date ASC`;
    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (err) { next(err); }
}

// PUT /api/maintenance/tasks/:id/complete
export async function completeTask(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid task_id' });
    const [result] = await pool.query(
      `UPDATE airline.service_tasks SET is_complete = 1, completed_datetime = NOW() WHERE task_id = ? AND is_complete = 0`,
      [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Task not found or already complete' });
    res.status(200).json({ message: 'Task marked complete' });
  } catch (err) { next(err); }
}

// POST /api/maintenance/logs
export async function submitLog(req, res, next) {
  try {
    const { task_id, employee_id, aircraft_id, hours_worked, service_performed } = req.body;
    if (!task_id || !employee_id || !aircraft_id || !hours_worked || !service_performed) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO airline.service_logs (task_id, employee_id, aircraft_id, hours_worked, service_performed) VALUES (?, ?, ?, ?, ?)`,
      [task_id, employee_id, aircraft_id, hours_worked, service_performed]
    );
    res.status(201).json({ message: 'Service log submitted', log_id: result.insertId });
  } catch (err) { next(err); }
}

// GET /api/maintenance/logs?employee_id=&start_date=&end_date=
export async function getLogs(req, res, next) {
  try {
    const employeeId = req.query.employee_id ? Number(req.query.employee_id) : null;
    const startDate = req.query.start_date || null;
    const endDate = req.query.end_date || null;
    const conditions = [];
    const params = [];
    if (employeeId) { conditions.push('sl.employee_id = ?'); params.push(employeeId); }
    if (startDate)  { conditions.push('sl.submitted_datetime >= ?'); params.push(startDate); }
    if (endDate)    { conditions.push('sl.submitted_datetime <= ?'); params.push(endDate + ' 23:59:59'); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `
      SELECT
        sl.log_id,
        sl.submitted_datetime,
        a.aircraft_id,
        a.aircraft_name,
        ast.status_name           AS aircraft_current_status,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        d.department_name,
        jt.title_name             AS job_title,
        st.task_id,
        st.task_description,
        st.estimated_hours,
        st.priority,
        sl.hours_worked,
        (sl.hours_worked - st.estimated_hours) AS hours_variance,
        st.scheduled_date,
        sl.parts_replaced,
        sl.service_performed,
        st.is_complete,
        st.completed_datetime,
        ap.iata AS airport_iata, ap.city AS airport_city, ap.country AS airport_country
      FROM airline.service_logs sl
      JOIN airline.aircrafts a         ON sl.aircraft_id = a.aircraft_id
      JOIN airline.aircraft_statuses ast ON a.aircraft_status_id = ast.aircraft_status_id
      JOIN airline.employees e         ON sl.employee_id = e.employee_id
      JOIN airline.departments d       ON e.department_id = d.department_id
      JOIN airline.job_titles jt       ON e.job_title_id = jt.job_title_id
      JOIN airline.service_tasks st    ON sl.task_id = st.task_id
      LEFT JOIN airline.airports ap    ON st.airport_id = ap.airport_id
      ${where}
      ORDER BY sl.submitted_datetime DESC
    `;
    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (err) { next(err); }
}

// POST /api/maintenance/issues
export async function submitIssue(req, res, next) {
  try {
    const { log_id, aircraft_id, issue_description } = req.body;
    if (!log_id || !aircraft_id || !issue_description) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    await pool.query(
      `INSERT INTO airline.service_issues (log_id, aircraft_id, issue_description) VALUES (?, ?, ?)`,
      [log_id, aircraft_id, issue_description]
    );
    res.status(201).json({ message: 'Issue reported' });
  } catch (err) { next(err); }
}

// GET /api/maintenance/issues?start_date=&end_date=
export async function getIssues(req, res, next) {
  try {
    const startDate = req.query.start_date || null;
    const endDate = req.query.end_date || null;
    const conditions = [];
    const params = [];
    if (startDate) { conditions.push('si.reported_datetime >= ?'); params.push(startDate); }
    if (endDate)   { conditions.push('si.reported_datetime <= ?'); params.push(endDate + ' 23:59:59'); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `
      SELECT
        si.issue_id,
        si.reported_datetime,
        a.aircraft_id,
        a.aircraft_name,
        ast.status_name             AS aircraft_current_status,
        si.issue_description,
        si.severity,
        si.safety_critical,
        si.resolved,
        si.log_id,
        sl.hours_worked,
        sl.service_performed,
        sl.submitted_datetime       AS log_submitted_datetime,
        CONCAT(e.first_name, ' ', e.last_name) AS reported_by,
        d.department_name,
        jt.title_name               AS job_title,
        st.task_description         AS related_task,
        ap.iata AS airport_iata, ap.city AS airport_city, ap.country AS airport_country
      FROM airline.service_issues si
      JOIN airline.aircrafts a         ON si.aircraft_id = a.aircraft_id
      JOIN airline.aircraft_statuses ast ON a.aircraft_status_id = ast.aircraft_status_id
      JOIN airline.service_logs sl     ON si.log_id = sl.log_id
      JOIN airline.employees e         ON sl.employee_id = e.employee_id
      JOIN airline.departments d       ON e.department_id = d.department_id
      JOIN airline.job_titles jt       ON e.job_title_id = jt.job_title_id
      JOIN airline.service_tasks st    ON sl.task_id = st.task_id
      LEFT JOIN airline.airports ap    ON st.airport_id = ap.airport_id
      ${where}
      ORDER BY si.reported_datetime DESC
    `;
    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (err) { next(err); }
}

// GET /api/maintenance/summary?employee_id=
export async function getSummary(req, res, next) {
  try {
    const employeeId = req.query.employee_id ? Number(req.query.employee_id) : null;
    const params = employeeId ? [employeeId] : [];
    const whereClause = employeeId ? 'WHERE sl.employee_id = ?' : '';

    const [[logStats]] = await pool.query(`
      SELECT
        COUNT(*)                        AS total_logs,
        COALESCE(SUM(sl.hours_worked), 0)   AS total_hours_worked,
        COALESCE(AVG(sl.hours_worked), 0)   AS avg_hours_per_log,
        COUNT(DISTINCT sl.aircraft_id)  AS aircraft_serviced,
        COALESCE(SUM(sl.hours_worked - st.estimated_hours), 0) AS total_hours_variance
      FROM airline.service_logs sl
      JOIN airline.service_tasks st ON sl.task_id = st.task_id
      ${whereClause}
    `, params);

    const [[issueStats]] = await pool.query(`
      SELECT COUNT(*) AS total_issues
      FROM airline.service_issues si
      JOIN airline.service_logs sl ON si.log_id = sl.log_id
      ${whereClause}
    `, params);

    const [taskStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_tasks,
        SUM(is_complete) AS completed_tasks
      FROM airline.service_tasks
      ${employeeId ? 'WHERE assigned_employee_id = ?' : ''}
    `, employeeId ? [employeeId] : []);

    const [topAircraft] = await pool.query(`
      SELECT a.aircraft_name, a.aircraft_id,
        COUNT(*) AS service_count,
        SUM(sl.hours_worked) AS total_hours
      FROM airline.service_logs sl
      JOIN airline.aircrafts a ON sl.aircraft_id = a.aircraft_id
      ${whereClause}
      GROUP BY sl.aircraft_id, a.aircraft_name
      ORDER BY total_hours DESC
      LIMIT 5
    `, params);

    res.status(200).json({
      logs: logStats,
      issues: issueStats,
      tasks: taskStats[0],
      topAircraft
    });
  } catch (err) { next(err); }
}
