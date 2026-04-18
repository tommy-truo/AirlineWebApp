import { searchFlights } from '../models/flight-instance-model.js';
import { db } from '../config/db.js';

// GET /api/flights/search?departureCity=(city)&arrivalCity=(city)&departureDate=(date)
export const findFlights = async (req, res) => {
    try {
        const { departureCity, arrivalCity, departureDate } = req.query;

        // Basic validation before hitting the database
        if (!departureCity || !arrivalCity) {
            return res.status(400).json({ 
                message: "Both departureCity and arrivalCity query parameters are required." 
            });
        }
        if (!departureDate) { return res.status(400).json({message: "Date parameter is required."}); }

        const flights = await searchFlights({ departureCity, arrivalCity, departureDate });

        res.status(200).json(flights);
    } catch (err) {
        console.error("Controller Error in findFlights:", err);
        res.status(500).json({ error: "Failed to search for flights." });
    }
};

// below added by aya

export const getDropdownData = async (req, res) => {
    try {
        const routesSql = `
            SELECT 
                fr.flight_route_id,
                fr.flight_number,
                dep.city AS departure_city,
                arr.city AS arrival_city
            FROM flight_routes fr
            JOIN airports dep ON fr.departure_airport_id = dep.airport_id
            JOIN airports arr ON fr.arrival_airport_id = arr.airport_id
            ORDER BY fr.flight_number ASC
        `;

        const aircraftsSql = `
            SELECT 
                a.aircraft_id,
                a.aircraft_name,
                ast.status_name
            FROM aircrafts a
            JOIN aircraft_statuses ast 
                ON a.aircraft_status_id = ast.aircraft_status_id
            ORDER BY a.aircraft_name ASC, a.aircraft_id ASC
        `;

        const gatesSql = `
            SELECT
                g.gate_id,
                ap.iata,
                t.name AS terminal_name,
                g.number AS gate_number
            FROM gates g
            JOIN terminals t ON g.terminal_id = t.terminal_id
            JOIN airports ap ON t.airport_id = ap.airport_id
            ORDER BY ap.iata ASC, t.name ASC, g.number ASC
        `;

        const statusesSql = `
            SELECT
                flight_status_id,
                status_name
            FROM flight_statuses
            ORDER BY flight_status_id ASC
        `;

        const reasonsSql = `
            SELECT
                flight_irregularity_reason_id,
                reason_name
            FROM flight_irregularity_reasons
            ORDER BY reason_name ASC
        `;

        const [
            [routes],
            [aircrafts],
            [gates],
            [statuses],
            [reasons]
        ] = await Promise.all([
            db.execute(routesSql),
            db.execute(aircraftsSql),
            db.execute(gatesSql),
            db.execute(statusesSql),
            db.execute(reasonsSql)
        ]);

        return res.status(200).json({
            routes,
            aircrafts,
            gates,
            statuses,
            reasons
        });
    } catch (err) {
        console.error("GET FLIGHT DROPDOWNS ERROR:", err.message || err);
        return res.status(500).json({
            message: "Error fetching flight dropdown data."
        });
    }
};

export const createFlight = async (req, res) => {
    const {
        flight_route_id,
        aircraft_id,
        departure_gate_id,
        arrival_gate_id,
        scheduled_departure_datetime,
        scheduled_arrival_datetime
    } = req.body;

    try {
        const sql = `
            INSERT INTO flight_instances (
                flight_route_id,
                aircraft_id,
                departure_gate_id,
                arrival_gate_id,
                status_id,
                status_reason_id,
                scheduled_departure_datetime,
                scheduled_arrival_datetime,
                actual_departure_datetime,
                actual_arrival_datetime
            )
            VALUES (?, ?, ?, ?, 1, 6, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(sql, [
            flight_route_id,
            aircraft_id,
            departure_gate_id,
            arrival_gate_id,
            scheduled_departure_datetime,
            scheduled_arrival_datetime,
            scheduled_departure_datetime,
            scheduled_arrival_datetime
        ]);

        return res.status(201).json({
            message: "Flight created successfully.",
            flight_instance_id: result.insertId
        });
    } catch (err) {
        console.error("CREATE FLIGHT ERROR:", err.message || err);
        return res.status(500).json({
            message: "Error creating flight."
        });
    }
};

export const getAllFlights = async (req, res) => {
    try {
        const sql = `
            SELECT
                fi.flight_instance_id,
                fi.aircraft_id,
                fi.departure_gate_id,
                fi.arrival_gate_id,
                fi.status_id,
                fi.status_reason_id,
                fr.flight_number,
                dep.city AS departure_city,
                arr.city AS arrival_city,
                a.aircraft_name,
                depGateAp.iata AS departure_airport_iata,
                depTerm.name AS departure_terminal,
                depGate.number AS departure_gate_number,
                arrGateAp.iata AS arrival_airport_iata,
                arrTerm.name AS arrival_terminal,
                arrGate.number AS arrival_gate_number,
                fs.status_name,
                fir.reason_name,
                fi.scheduled_departure_datetime,
                fi.scheduled_arrival_datetime,
                fi.actual_departure_datetime,
                fi.actual_arrival_datetime
            FROM flight_instances fi
            JOIN flight_routes fr ON fi.flight_route_id = fr.flight_route_id
            JOIN airports dep ON fr.departure_airport_id = dep.airport_id
            JOIN airports arr ON fr.arrival_airport_id = arr.airport_id
            JOIN aircrafts a ON fi.aircraft_id = a.aircraft_id
            JOIN gates depGate ON fi.departure_gate_id = depGate.gate_id
            JOIN terminals depTerm ON depGate.terminal_id = depTerm.terminal_id
            JOIN airports depGateAp ON depTerm.airport_id = depGateAp.airport_id
            JOIN gates arrGate ON fi.arrival_gate_id = arrGate.gate_id
            JOIN terminals arrTerm ON arrGate.terminal_id = arrTerm.terminal_id
            JOIN airports arrGateAp ON arrTerm.airport_id = arrGateAp.airport_id
            JOIN flight_statuses fs ON fi.status_id = fs.flight_status_id
            LEFT JOIN flight_irregularity_reasons fir
                ON fi.status_reason_id = fir.flight_irregularity_reason_id
            ORDER BY fi.scheduled_departure_datetime DESC
            LIMIT 100
        `;

        const [rows] = await db.execute(sql);

        return res.status(200).json(rows);
    } catch (err) {
        console.error("GET ALL FLIGHTS ERROR:", err.message || err);
        return res.status(500).json({
            message: "Error fetching flights."
        });
    }
};

export const updateFlight = async (req, res) => {
    const { id } = req.params;
    const {
        aircraft_id,
        departure_gate_id,
        arrival_gate_id,
        status_id,
        status_reason_id,
        scheduled_departure_datetime,
        scheduled_arrival_datetime
    } = req.body;

    try {
        const numericStatusId = Number(status_id);

        let finalReasonId = status_reason_id || 6;
        let actualDepartureSql = `actual_departure_datetime`;
        let actualArrivalSql = `actual_arrival_datetime`;

        if (numericStatusId === 3 || numericStatusId === 4) {
            finalReasonId = status_reason_id;
        }

        if (numericStatusId === 5 || numericStatusId === 6) {
            actualDepartureSql = `CASE
                WHEN actual_departure_datetime = scheduled_departure_datetime
                THEN NOW()
                ELSE actual_departure_datetime
            END`;
        }

        if (numericStatusId === 7) {
            actualArrivalSql = `NOW()`;

            actualDepartureSql = `CASE
                WHEN actual_departure_datetime = scheduled_departure_datetime
                THEN NOW()
                ELSE actual_departure_datetime
            END`;
        }

        const sql = `
            UPDATE flight_instances
            SET
                aircraft_id = ?,
                departure_gate_id = ?,
                arrival_gate_id = ?,
                status_id = ?,
                status_reason_id = ?,
                scheduled_departure_datetime = CASE
                    WHEN ? IS NOT NULL AND ? != '' THEN ?
                    ELSE scheduled_departure_datetime
                END,
                scheduled_arrival_datetime = CASE
                    WHEN ? IS NOT NULL AND ? != '' THEN ?
                    ELSE scheduled_arrival_datetime
                END,
                actual_departure_datetime = ${actualDepartureSql},
                actual_arrival_datetime = ${actualArrivalSql}
            WHERE flight_instance_id = ?
        `;

        await db.execute(sql, [
            aircraft_id,
            departure_gate_id,
            arrival_gate_id,
            status_id,
            finalReasonId,
            scheduled_departure_datetime,
            scheduled_departure_datetime,
            scheduled_departure_datetime,
            scheduled_arrival_datetime,
            scheduled_arrival_datetime,
            scheduled_arrival_datetime,
            id
        ]);

        return res.status(200).json({
            message: "Flight updated successfully."
        });
    } catch (err) {
        console.error("UPDATE FLIGHT ERROR:", err.message || err);
        return res.status(500).json({
            message: "Error updating flight."
        });
    }
};
