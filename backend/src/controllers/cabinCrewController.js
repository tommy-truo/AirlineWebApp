import { json } from 'express';
import { db } from '../config/db.js';
// Shift Calendar
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
      WHERE fea.employee_id = ?
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