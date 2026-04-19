import { json } from 'express';
import { db } from '../config/db.js';
// Shift Calendar
export const getShiftCalendar = async (req, res, next) => {
  const employeeId = req.query.employee_id;

  if (!employeeId) {
    return res.status(400).json({ error: 'employee_id is required' });
  }

  const sql = `
    SELECT
    fea.assignment_id AS shift_id,
    fi.scheduled_departure_datetime,
    fi.scheduled_arrival_datetime,
    DATE(fi.scheduled_departure_datetime) AS shift_date,
    TIME(fi.scheduled_departure_datetime) AS start_time,
    TIME(fi.scheduled_arrival_datetime) AS end_time,
    DAYNAME(fi.scheduled_departure_datetime) AS day_name,
    fr.flight_number,
    da.city AS departure_city,
    aa.city AS arrival_city,
    fi.aircraft_id,
    ac.aircraft_name,
    feat.type_name AS assignment_role,
    e.first_name,
    e.last_name,
    fs.status_name AS flight_status
  FROM airline.flight_employee_assignments fea
  JOIN airline.employees e
    ON fea.employee_id = e.employee_id
  JOIN airline.flight_employee_assignment_types feat
    ON fea.assignment_type_id = feat.assignment_type_id
  JOIN airline.flight_instances fi
    ON fea.flight_instance_id = fi.flight_instance_id
  JOIN airline.flight_routes fr
    ON fi.flight_route_id = fr.flight_route_id
  JOIN airline.airports da
    ON fr.departure_airport_id = da.airport_id
  JOIN airline.airports aa
    ON fr.arrival_airport_id = aa.airport_id
  JOIN airline.flight_statuses fs
    ON fi.status_id = fs.flight_status_id
  JOIN airline.aircrafts ac
    ON fi.aircraft_id = ac.aircraft_id
  WHERE e.employee_id = ?
  ORDER BY fi.scheduled_departure_datetime
  `;

  try {
    const [results] = await db.query(sql, [employeeId]);
    res.json(results);
  }
  catch (err) {
    return next(err);
  }
};

// add, swap, drop shifts
export const submitShiftRequest = async (req, res, next) => {
  const { employee_id, assignment_id, request_type, reason } = req.body;

  const sql = `
    INSERT INTO airline.shift_requests
    (employee_id, assignment_id, request_type, reason, status, submitted_datetime)
    VALUES (?, ?, ?, ?, 'Pending', NOW())
  `;

  try {
    const [results] = await db.query(sql, [employee_id, assignment_id, request_type, reason]);
    res.json({ message: 'Request submitted successfully ' });
  }
  catch (err) {
    return next(err);
  }
};

// scheduled flights
export const getScheduledFlights = async (req, res, next) => {
  const employeeId = req.query.employee_id;

  if (!employeeId) {
    return res.status(400).json({ error: 'employee_id is required' });
  }

  const sql = `
  SELECT
    fea.assignment_id,
    fi.flight_instance_id,
    e.employee_id,
    e.first_name,
    e.last_name,
    fr.flight_number,
    da.city AS departure_city,
    aa.city AS arrival_city,
    fi.scheduled_departure_datetime,
    fi.scheduled_arrival_datetime,
    fr.estimated_distance_km,
    fr.estimated_duration_minutes,
    fi.aircraft_id,
    ac.aircraft_name
  FROM airline.flight_employee_assignments fea
  JOIN airline.employees e
    ON fea.employee_id = e.employee_id
  JOIN airline.flight_instances fi
    ON fea.flight_instance_id = fi.flight_instance_id
  JOIN airline.flight_routes fr
    ON fi.flight_route_id = fr.flight_route_id
  JOIN airline.aircrafts ac
    ON fi.aircraft_id = ac.aircraft_id
  JOIN airline.airports da
    ON fr.departure_airport_id = da.airport_id
  JOIN airline.airports aa
    ON fr.arrival_airport_id = aa.airport_id
  WHERE e.employee_id = ?
  ORDER BY fi.scheduled_departure_datetime
`;

  try {
    const [results] = await db.query(sql, [employeeId]);
    res.json(results);
  }
  catch (err) {
    return next(err);
  }
};

// to see shift requests
export const getShiftRequests = async (req, res, next) => {
  const employeeId = req.query.employee_id;

  if (!employeeId) {
    return res.status(400).json({ error: 'employee_id is required' });
  }

  const sql = `
    SELECT
      sr.shift_request_id,
      sr.request_type,
      sr.status,
      sr.reason,
      sr.submitted_datetime,
      sr.reviewed_datetime,
      fr.flight_number,
      da.city AS departure_city,
      aa.city AS arrival_city
    FROM airline.shift_requests sr
    LEFT JOIN airline.flight_employee_assignments fea
      ON sr.assignment_id = fea.assignment_id
    LEFT JOIN airline.flight_instances fi
      ON COALESCE(sr.requested_flight_instance_id, fea.flight_instance_id) = fi.flight_instance_id
    LEFT JOIN airline.flight_routes fr
      ON fi.flight_route_id = fr.flight_route_id
    LEFT JOIN airline.airports da
      ON fr.departure_airport_id = da.airport_id
    LEFT JOIN airline.airports aa
      ON fr.arrival_airport_id = aa.airport_id
    WHERE sr.employee_id = ?
    ORDER BY sr.submitted_datetime DESC
  `;

  try {
    const [results] = await db.query(sql, [employeeId]);
    res.json(results);
  }
  catch (err) {
    return next(err);
  }
};

// personal info / HR
export const getProfile = async (req, res, next) => {
  const employeeId = req.query.employee_id;

  if (!employeeId) {
    return res.status(400).json({ error: 'employee_id is required' });
  }

  const sql = `
    SELECT
      e.employee_id,
      e.first_name,
      e.middle_initial,
      e.last_name,
      e.date_of_birth,
      e.salary,
      e.start_date,
      e.emergency_contact_name,
      e.emergency_contact_phone,
      e.emergency_contact_relationship,
      a.email,
      d.department_name,
      jt.title_name
    FROM airline.employees e
    JOIN airline.accounts a
      ON e.account_id = a.account_id
    JOIN airline.departments d
      ON e.department_id = d.department_id
    JOIN airline.job_titles jt
      ON e.job_title_id = jt.job_title_id
    WHERE e.employee_id = ?
  `;


  try {
    const [results] = await db.query(sql, [employeeId]);
    if (results.length === 0) {
      return res.status(404).json({ errror: 'Employee not found' });
    }
    res.json(results[0]);
  }
  catch (err) {
    return next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  const {
    employee_id,
    first_name,
    middle_initial,
    last_name,
    email,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship
  } = req.body;

  if (!employee_id) {
    return res.status(400).json({ error: 'employee_id is required' });
  }

  const getAccountSql = `
    SELECT account_id
    FROM airline.employees
    WHERE employee_id = ?
  `;

  const updateEmployeeSql = `
    UPDATE airline.employees
    SET
      first_name = ?,
      middle_initial = ?,
      last_name = ?,
      emergency_contact_name = ?,
      emergency_contact_phone = ?,
      emergency_contact_relationship = ?
    WHERE employee_id = ?
  `;

  const updateAccountSql = `
    UPDATE airline.accounts
    SET email = ?
    WHERE account_id = ?
  `;

  try {
    const [results] = await db.query(getAccountSql, [employee_id]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const accountId = results[0].account_id;

    await db.query(updateEmployeeSql, [
      first_name,
      middle_initial,
      last_name,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      employee_id
    ]);

    await db.query(updateAccountSql, [email, accountId]);

    res.json({ message: 'Personal info updated successfully' });
  } catch (err) {
    return next(err);
  }
};

export const getCrewManifest = async (req, res, next) => {
  const { employee_id, flight_id } = req.query;

  if (!employee_id || !flight_id) {
    return res.status(400).json({
      error: 'employee_id and flight_id are required'
    });
  }

  const verifySql = `
    SELECT 1
    FROM airline.flight_employee_assignments
    WHERE employee_id = ?
      AND flight_instance_id = ?
    LIMIT 1
  `;

  const crewSql = `
    SELECT
      e.employee_id,
      e.first_name,
      e.last_name,
      feat.type_name AS assignment_role,
      d.department_name
    FROM airline.flight_employee_assignments fea
    JOIN airline.employees e
      ON fea.employee_id = e.employee_id
    JOIN airline.flight_employee_assignment_types feat
      ON fea.assignment_type_id = feat.assignment_type_id
    LEFT JOIN airline.departments d
      ON e.department_id = d.department_id
    WHERE fea.flight_instance_id = ?
    ORDER BY feat.type_name, e.last_name, e.first_name
  `;

  try {
    const [allowed] = await db.query(verifySql, [employee_id, flight_id]);

    if (allowed.length === 0) {
      return res.status(403).json({
        error: 'You are not assigned to this flight'
      });
    }

    const [results] = await db.query(crewSql, [flight_id]);
    res.json(results);
  } catch (err) {
    return next(err);
  }
};

export const updateEmergencyContact = async (req, res, next) => {
  const {
    employee_id,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship
  } = req.body;

  if (!employee_id) {
    return res.status(400).json({ error: 'employee_id is required' });
  }

  const sql = `
    UPDATE airline.employees
    SET
      emergency_contact_name = ?,
      emergency_contact_phone = ?,
      emergency_contact_relationship = ?
    WHERE employee_id = ?
  `;

  try {
    const [result] = await db.query(sql, [
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      employee_id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Emergency contact updated successfully' });
  } catch (err) {
    return next(err);
  }
};

export const getFlightReports = async (req, res, next) => {
  try {
    const {
      employee_id,
      start_datetime,
      end_datetime,
      status,
      flight_number,
      irregular_only
    } = req.query;

    if (!employee_id) {
      return res.status(400).json({ error: 'employee_id is required' });
    }

    let sql = `
  SELECT
    rep.report_id,
    rep.flight_instance_id,
    rep.employee_id,
    rep.aircraft_id,
    ac.aircraft_name,
    rep.hours_flown,
    rep.distance_flown_km,
    rep.final_status,
    rep.irregular_reason,
    rep.notes,
    rep.submitted_at,
    fr.flight_number,
    fi.scheduled_departure_datetime,
    fi.scheduled_arrival_datetime
  FROM airline.flight_reports rep
  JOIN airline.flight_instances fi
    ON rep.flight_instance_id = fi.flight_instance_id
  JOIN airline.flight_routes fr
    ON fi.flight_route_id = fr.flight_route_id
  JOIN airline.aircrafts ac
    ON rep.aircraft_id = ac.aircraft_id
  WHERE rep.employee_id = ?
`;

    const params = [employee_id];

    if (start_datetime) {
      sql += ` AND fi.scheduled_departure_datetime >= ?`;
      params.push(start_datetime + ' 00:00:00');
    }

    if (end_datetime) {
      sql += ` AND fi.scheduled_departure_datetime <= ?`;
      params.push(end_datetime + ' 23:59:59');
    }

    if (status && status !== 'All') {
      sql += ` AND rep.final_status = ?`;
      params.push(status);
    }

    if (flight_number) {
      sql += ` AND fr.flight_number LIKE ?`;
      params.push(`%${flight_number}%`);
    }

    if (irregular_only === 'true') {
      sql += ` AND rep.final_status != 'Completed'`;
    }

    sql += ` ORDER BY rep.submitted_at DESC`;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getPendingFlightReports = async (req, res, next) => {
  try {
    const { employee_id } = req.query;

    if (!employee_id) {
      return res.status(400).json({ error: 'employee_id is required' });
    }

    const [rows] = await db.query(
      `
      SELECT
    fi.flight_instance_id,
    fr.flight_number,
    da.city AS departure_city,
    aa.city AS arrival_city,
    fi.scheduled_departure_datetime,
    fi.scheduled_arrival_datetime,
    fi.aircraft_id,
    ac.aircraft_name
  FROM airline.flight_employee_assignments fea
  JOIN airline.flight_instances fi
    ON fea.flight_instance_id = fi.flight_instance_id
  JOIN airline.flight_routes fr
    ON fi.flight_route_id = fr.flight_route_id
  JOIN airline.airports da
    ON fr.departure_airport_id = da.airport_id
  JOIN airline.airports aa
    ON fr.arrival_airport_id = aa.airport_id
  JOIN airline.aircrafts ac
    ON fi.aircraft_id = ac.aircraft_id
  LEFT JOIN airline.flight_reports rep
    ON rep.flight_instance_id = fi.flight_instance_id
   AND rep.employee_id = fea.employee_id
  WHERE fea.employee_id = ?
    AND fi.scheduled_arrival_datetime < NOW()
    AND rep.report_id IS NULL
  ORDER BY fi.scheduled_departure_datetime DESC
      `,
      [employee_id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const submitFlightReport = async (req, res, next) => {
  try {
    const {
      employee_id,
      flight_instance_id,
      aircraft_id,
      hours_flown,
      distance_flown_km,
      status,
      irregular_reason,
      notes
    } = req.body;

    if (!employee_id || !flight_instance_id || !aircraft_id || !hours_flown || !distance_flown_km || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (status !== 'Completed' && !irregular_reason) {
      return res.status(400).json({ error: 'Irregular reason is required for non-completed flights' });
    }

    const [result] = await db.query(
      `
            INSERT INTO airline.flight_reports (
                flight_instance_id,
                employee_id,
                aircraft_id,
                hours_flown,
                distance_flown_km,
                final_status,
                irregular_reason,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
      [
        flight_instance_id,
        employee_id,
        aircraft_id,
        hours_flown,
        distance_flown_km,
        status,
        irregular_reason || null,
        notes || null
      ]
    );

    res.status(201).json({
      message: 'Flight report submitted successfully',
      report_id: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

export const getFlightReportDetails = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { employee_id } = req.query;

    if (!employee_id) {
      return res.status(400).json({ error: 'employee_id is required' });
    }

    const [rows] = await db.query(
      `
      SELECT
    fr.report_id,
    fr.hours_flown,
    fr.distance_flown_km,
    fr.final_status,
    fr.irregular_reason,
    fr.notes,
    fr.submitted_at,
    fi.flight_instance_id,
    fi.scheduled_departure_datetime,
    fi.scheduled_arrival_datetime,
    fi.actual_departure_datetime,
    fi.actual_arrival_datetime,
    fi.aircraft_id,
    ac.aircraft_name,
    TIMESTAMPDIFF(
      MINUTE,
      fi.actual_departure_datetime,
      fi.actual_arrival_datetime
    ) AS actual_duration,
    r.flight_number,
    CONCAT(dep.city, ' (', dep.iata, ')') AS departure_city,
    CONCAT(arr.city, ' (', arr.iata, ')') AS arrival_city
  FROM flight_reports fr
  JOIN flight_instances fi
    ON fr.flight_instance_id = fi.flight_instance_id
  JOIN flight_routes r
    ON fi.flight_route_id = r.flight_route_id
  JOIN airports dep
    ON r.departure_airport_id = dep.airport_id
  JOIN airports arr
    ON r.arrival_airport_id = arr.airport_id
  JOIN airline.aircrafts ac
    ON fi.aircraft_id = ac.aircraft_id
  WHERE fr.report_id = ?
    AND fr.employee_id = ?
      `,
      [reportId, employee_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = rows[0];

    const [crewRows] = await db.query(
      `
      SELECT
  e.first_name,
  e.last_name,
  feat.type_name AS assignment_role
FROM flight_employee_assignments fea
JOIN employees e
  ON fea.employee_id = e.employee_id
JOIN flight_employee_assignment_types feat
  ON fea.assignment_type_id = feat.assignment_type_id
WHERE fea.flight_instance_id = ?
ORDER BY
  CASE
    WHEN feat.type_name = 'Operating Captain' THEN 1
    WHEN feat.type_name = 'First Officer' THEN 2
    WHEN feat.type_name = 'Cabin Crew' THEN 3
    ELSE 99
  END,
  e.last_name,
  e.first_name
      `,
      [report.flight_instance_id]
    );


    report.crew_assigned = crewRows.map(
      (member) =>
        `${member.first_name} ${member.last_name}${member.assignment_role ? ` (${member.assignment_role})` : ''
        }`
    );

    res.json(report);
  } catch (err) {
    console.error('getFlightReportDetails error:', err);
    next(err);
  }
};