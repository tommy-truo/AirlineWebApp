import { pool } from '../db.js';

// GET /api/cabin-brief/flight/:flightInstanceId
// Returns passenger count per cabin class for a specific flight instance.
// Join path: tickets -> seats (seat_id) -> cabin_classes (cabin_class_id)
export async function getCabinBrief(req, res, next) {
  try {
    const flightInstanceId = Number(req.params.flightInstanceId);
    if (!Number.isInteger(flightInstanceId) || flightInstanceId <= 0) {
      return res.status(400).json({ message: 'Invalid flight_instance_id' });
    }

    const sql = `
      SELECT
        cc.cabin_class_id,
        cc.class_name,
        COUNT(t.ticket_id) AS passenger_count
      FROM airline.tickets t
      JOIN airline.seats s
        ON t.seat_id = s.seat_id
      JOIN airline.cabin_classes cc
        ON s.cabin_class_id = cc.cabin_class_id
      WHERE t.flight_instance_id = ?
      GROUP BY cc.cabin_class_id, cc.class_name
      ORDER BY cc.cabin_class_id
    `;
    const [rows] = await pool.query(sql, [flightInstanceId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No tickets found for this flight' });
    }

    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}
