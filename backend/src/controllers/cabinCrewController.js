import { json } from 'express';
import { db } from '../config/db.js';
// Shift Calendar
export const getCabinCrewShiftCalendar = async (req, res, next) => {
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
    feat.type_name AS assignment_role,
    e.first_name,
    e.last_name,
    ac.aircraft_name,
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
    AND feat.type_name = 'Cabin Crew'
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
export const submitCabinCrewShiftRequest = async (req, res, next) => {
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

// to see shift requests
export const getCabinCrewShiftRequests = async (req, res, next) => {
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

//scheduled flights
export const getCabinCrewScheduledFlights = async (req, res, next) => {
  try {
    const { employee_id } = req.query;

    const [rows] = await db.query(
      `
      SELECT
        fi.flight_instance_id,
        fr.flight_number,
        fi.scheduled_departure_datetime,
        fi.scheduled_arrival_datetime,
        da.city AS departure_city,
        aa.city AS arrival_city,
        fi.aircraft_id
      FROM flight_employee_assignments fea
      JOIN flight_instances fi ON fea.flight_instance_id = fi.flight_instance_id
      JOIN flight_routes fr ON fi.flight_route_id = fr.flight_route_id
      JOIN airports da ON fr.departure_airport_id = da.airport_id
      JOIN airports aa ON fr.arrival_airport_id = aa.airport_id
      JOIN flight_employee_assignment_types feat
  ON fea.assignment_type_id = feat.assignment_type_id
      WHERE fea.employee_id = ?
        AND feat.type_name = 'Cabin Crew'
      ORDER BY fi.scheduled_departure_datetime
      `,
      [employee_id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getCabinCrewProfile = async (req, res) => {
  res.json({ message: 'Cabin crew profile not implemented yet' });
};

export const updateCabinCrewEmergencyContact = async (req, res) => {
  res.json({ message: 'Update not implemented yet' });
};

export const getCabinCrewManifest = async (req, res) => {
  res.json({ message: 'Manifest not implemented yet' });
};