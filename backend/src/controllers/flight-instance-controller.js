import { searchFlights } from '../models/flight-instance-model.js';
import { db } from '../config/db.js';

// GET /api/flights/search?departureCity=(city)&arrivalCity=(city)&departureDate=(date)
export const findFlights = async (req, res) => {
    try {
        const { departureCity, arrivalCity, departureDate } = req.query;

        if (!departureCity || !arrivalCity) {
            return res.status(400).json({
                message: "Both departureCity and arrivalCity query parameters are required."
            });
        }

        if (!departureDate) {
            return res.status(400).json({
                message: "Date parameter is required."
            });
        }

        const flights = await searchFlights({ departureCity, arrivalCity, departureDate });

        res.status(200).json(flights);
    } catch (err) {
        console.error("Controller Error in findFlights:", err);
        res.status(500).json({ error: "Failed to search for flights." });
    }
};

// below by aya
export const getDropdownData = async (req, res) => {
    try {
        const routesSql = `
            SELECT 
                fr.flight_route_id,
                fr.flight_number,
                fr.departure_airport_id,
                fr.arrival_airport_id,
                fr.estimated_duration_minutes,
                dep.city AS departure_city,
                dep.iata AS departure_iata,
                arr.city AS arrival_city,
                arr.iata AS arrival_iata
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
                t.airport_id,
                ap.iata AS iata_code,
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

        const [routesResult] = await db.execute(routesSql);
        const [aircraftsResult] = await db.execute(aircraftsSql);
        const [gatesResult] = await db.execute(gatesSql);
        const [statusesResult] = await db.execute(statusesSql);
        const [reasonsResult] = await db.execute(reasonsSql);

        const routes = routesResult || [];
        const aircrafts = aircraftsResult || [];
        const gates = gatesResult || [];
        const statuses = statusesResult || [];
        const reasons = reasonsResult || [];

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

function formatMySQLDateTime(value) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function getFlightById(flightInstanceId) {
    const sql = `
        SELECT
            fi.flight_instance_id,
            fi.flight_route_id,
            fi.aircraft_id,
            fi.departure_gate_id,
            fi.arrival_gate_id,
            fi.status_id,
            fi.status_reason_id,
            fi.scheduled_departure_datetime,
            fi.scheduled_arrival_datetime,
            fi.actual_departure_datetime,
            fi.actual_arrival_datetime,
            fr.departure_airport_id,
            fr.arrival_airport_id
        FROM flight_instances fi
        JOIN flight_routes fr ON fi.flight_route_id = fr.flight_route_id
        WHERE fi.flight_instance_id = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [flightInstanceId]);
    return rows[0] || null;
}

async function getAircraftStatusName(aircraftId) {
    const sql = `
        SELECT ast.status_name
        FROM aircrafts a
        JOIN aircraft_statuses ast
            ON a.aircraft_status_id = ast.aircraft_status_id
        WHERE a.aircraft_id = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [aircraftId]);
    return rows[0]?.status_name || null;
}

async function hasAircraftConflict({ flightInstanceId, aircraftId, scheduledDeparture, scheduledArrival }) {
    const sql = `
        SELECT 1
        FROM flight_instances
        WHERE aircraft_id = ?
          AND flight_instance_id != ?
          AND scheduled_departure_datetime < ?
          AND scheduled_arrival_datetime > ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [
        aircraftId,
        flightInstanceId,
        scheduledArrival,
        scheduledDeparture
    ]);

    return rows.length > 0;
}

async function hasGateConflict({
    flightInstanceId,
    departureGateId,
    arrivalGateId,
    scheduledDeparture,
    scheduledArrival
}) {
    const sql = `
        SELECT 1
        FROM flight_instances
        WHERE flight_instance_id != ?
          AND (departure_gate_id = ? OR arrival_gate_id = ?)
          AND scheduled_departure_datetime < ?
          AND scheduled_arrival_datetime > ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [
        flightInstanceId,
        departureGateId,
        arrivalGateId,
        scheduledArrival,
        scheduledDeparture
    ]);

    return rows.length > 0;
}

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
        const formattedDeparture = formatMySQLDateTime(scheduled_departure_datetime);
        const formattedArrival = formatMySQLDateTime(scheduled_arrival_datetime);

        if (!flight_route_id || !aircraft_id || !departure_gate_id || !arrival_gate_id) {
            return res.status(400).json({
                message: "All required flight fields must be provided."
            });
        }

        if (!formattedDeparture || !formattedArrival) {
            return res.status(400).json({
                message: "Invalid departure or arrival datetime."
            });
        }

        if (departure_gate_id === arrival_gate_id) {
            return res.status(400).json({
                message: "Departure and arrival gates cannot be the same."
            });
        }

        const aircraftStatusName = await getAircraftStatusName(aircraft_id);

        if (!aircraftStatusName) {
            return res.status(400).json({
                message: "Selected aircraft does not exist."
            });
        }

        if (aircraftStatusName !== 'Active') {
            return res.status(400).json({
                message: "Aircraft is not available for assignment."
            });
        }

        const aircraftConflict = await hasAircraftConflict({
            flightInstanceId: 0,
            aircraftId: aircraft_id,
            scheduledDeparture: formattedDeparture,
            scheduledArrival: formattedArrival
        });

        if (aircraftConflict) {
            return res.status(400).json({
                message: "Aircraft is already assigned to another flight at this time."
            });
        }

        const gateConflict = await hasGateConflict({
            flightInstanceId: 0,
            departureGateId: departure_gate_id,
            arrivalGateId: arrival_gate_id,
            scheduledDeparture: formattedDeparture,
            scheduledArrival: formattedArrival
        });

        if (gateConflict) {
            return res.status(400).json({
                message: "Selected gate is already in use during this time."
            });
        }

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
            formattedDeparture,
            formattedArrival,
            formattedDeparture,
            formattedArrival
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
                fr.departure_airport_id,
                fr.arrival_airport_id,
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
        const existingFlight = await getFlightById(id);

        if (!existingFlight) {
            return res.status(404).json({
                message: "Flight not found."
            });
        }

        const finalAircraftId = aircraft_id || existingFlight.aircraft_id;
        const finalDepartureGateId = departure_gate_id || existingFlight.departure_gate_id;
        const finalArrivalGateId = arrival_gate_id || existingFlight.arrival_gate_id;
        const finalStatusId = status_id ? Number(status_id) : Number(existingFlight.status_id);

        if (!finalAircraftId || !finalDepartureGateId || !finalArrivalGateId) {
            return res.status(400).json({
                message: "Aircraft and both gates are required."
            });
        }

        if (String(finalDepartureGateId) === String(finalArrivalGateId)) {
            return res.status(400).json({
                message: "Departure and arrival gates cannot be the same."
            });
        }

        const currentScheduledDeparture = formatMySQLDateTime(existingFlight.scheduled_departure_datetime);
        const currentScheduledArrival = formatMySQLDateTime(existingFlight.scheduled_arrival_datetime);

        const formattedScheduledDeparture = scheduled_departure_datetime
            ? formatMySQLDateTime(scheduled_departure_datetime)
            : currentScheduledDeparture;

        const formattedScheduledArrival = scheduled_arrival_datetime
            ? formatMySQLDateTime(scheduled_arrival_datetime)
            : currentScheduledArrival;

        if (!formattedScheduledDeparture || !formattedScheduledArrival) {
            return res.status(400).json({
                message: "Invalid scheduled departure or arrival datetime."
            });
        }

        const aircraftStatusName = await getAircraftStatusName(finalAircraftId);

        if (!aircraftStatusName) {
            return res.status(400).json({
                message: "Selected aircraft does not exist."
            });
        }

        if (aircraftStatusName !== 'Active') {
            return res.status(400).json({
                message: "Aircraft is not available for assignment."
            });
        }

        const aircraftConflict = await hasAircraftConflict({
            flightInstanceId: id,
            aircraftId: finalAircraftId,
            scheduledDeparture: formattedScheduledDeparture,
            scheduledArrival: formattedScheduledArrival
        });

        if (aircraftConflict) {
            return res.status(400).json({
                message: "Aircraft is already assigned to another flight at this time."
            });
        }

        const gateConflict = await hasGateConflict({
            flightInstanceId: id,
            departureGateId: finalDepartureGateId,
            arrivalGateId: finalArrivalGateId,
            scheduledDeparture: formattedScheduledDeparture,
            scheduledArrival: formattedScheduledArrival
        });

        if (gateConflict) {
            return res.status(400).json({
                message: "Selected gate is already in use during this time."
            });
        }

        let finalReasonId = 6;
        let actualDepartureSql = `actual_departure_datetime`;
        let actualArrivalSql = `actual_arrival_datetime`;

        if (finalStatusId === 3 || finalStatusId === 4) {
            if (!status_reason_id) {
                return res.status(400).json({
                    message: "A reason is required for delayed or cancelled flights."
                });
            }

            finalReasonId = status_reason_id;
        }

        if (finalStatusId === 5 || finalStatusId === 6) {
            actualDepartureSql = `CASE
                WHEN actual_departure_datetime = scheduled_departure_datetime
                THEN NOW()
                ELSE actual_departure_datetime
            END`;
        }

        if (finalStatusId === 7) {
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
                scheduled_departure_datetime = ?,
                scheduled_arrival_datetime = ?,
                actual_departure_datetime = ${actualDepartureSql},
                actual_arrival_datetime = ${actualArrivalSql}
            WHERE flight_instance_id = ?
        `;

        await db.execute(sql, [
            finalAircraftId,
            finalDepartureGateId,
            finalArrivalGateId,
            finalStatusId,
            finalReasonId,
            formattedScheduledDeparture,
            formattedScheduledArrival,
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
