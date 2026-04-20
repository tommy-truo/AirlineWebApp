/* Abhishek Singh */

import { db } from "../config/db.js";

export const getAllAirports = async (req, res) => {     //1. Get all airports
    try {
        const [rows] = await db.query(
            "SELECT iata, name FROM airports ORDER BY iata ASC"     //iata and name from airports. ascending order alphabetically.
        );
        res.json(rows);     //send list to frntnd
    } catch (err) { 
        console.error("Error fetching airports:", err);             // Throw error
        res.status(500).json([]); 
    }
};

//Func. shows dashboard flight data
export const getDashboardFlights = async (req, res) => {
    try {
        const { airport } = req.query;      // Recieve airport code from frntnd

        const query = `
        SELECT 
            fi.flight_instance_id,
            fr.flight_number,
            fi.departure_gate_id,
            fi.arrival_gate_id,
            fi.scheduled_departure_datetime,
            fi.scheduled_arrival_datetime,
            fs.status_name,
            dep.iata AS origin_iata,
            arr.iata AS destination_iata
        FROM flight_instances fi
        LEFT JOIN flight_statuses fs
            ON fi.status_id = fs.flight_status_id
        JOIN flight_routes fr
            ON fi.flight_route_id = fr.flight_route_id
        JOIN airports dep
            ON fr.departure_airport_id = dep.airport_id
        JOIN airports arr
            ON fr.arrival_airport_id = arr.airport_id
        WHERE
            (dep.iata = ? OR arr.iata = ?)
            AND fi.scheduled_departure_datetime >= NOW()
        ORDER BY fi.scheduled_departure_datetime ASC;
        `; 

        const [rows] = await db.query(query, [airport, airport]);
        res.json(rows);                                             //send flight to frntnd
    } catch (err) { 
        console.error("Error fetching dashboard info:", err);
        res.status(500).json([]);                                   //Throw error
    }
};

//Searching for passenger info using ticket id. show passenger name, flight info, baggage count, baggage weight, and update check in status if not already checked in.
export const getPassengerDetailsByTicket = async (req, res) => { 
    try {
        const { ticket } = req.query; // Recieve ticket id from frntnd.

            const query = `
                SELECT 
                    t.ticket_id,
                    t.booking_id,
                    t.flight_instance_id,
                    t.checked_in,
                    t.seat_id,
                    p.first_name,
                    p.last_name,
                    p.passport_number,
                    bg.group_name AS boarding_group,
                    fr.flight_number AS flight_number,
                    dep.iata AS origin_iata,
                    arr.iata AS destination_iata,
                    (SELECT COUNT(*) FROM baggage WHERE ticket_id = t.ticket_id) AS baggage_count,
                    (SELECT COALESCE(SUM(weight), 0) FROM baggage WHERE ticket_id = t.ticket_id) AS baggage_weight
                FROM Tickets t
                LEFT JOIN Passengers p ON t.passenger_id = p.passenger_id
                LEFT JOIN boarding_groups bg ON t.boarding_group_id = bg.boarding_group_id
                LEFT JOIN flight_instances fi ON t.flight_instance_id = fi.flight_instance_id
                LEFT JOIN flight_routes fr ON fi.flight_route_id = fr.flight_route_id
                LEFT JOIN airports dep ON fr.departure_airport_id = dep.airport_id
                LEFT JOIN airports arr ON fr.arrival_airport_id = arr.airport_id
                WHERE t.ticket_id = ?
            `;

        const [rows] = await db.query(query, [ticket]); // replace with ticket no.

        if (rows.length === 0) {
            return res.status(404).json({ error: "No ticket found" });
        }

        res.json(                       // from 1 and 0 to checked in and pending.
            rows.map(row => ({
                ...row,
                check_in_status: row.checked_in === 1 
                    ? "Checked In" 
                    : "Pending"
            }))
        ); 

    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

// Adds baggage. update number of baggage, update weight of each added baggage, update the total fees in baggage and transaction tables.
export const createBaggageTransaction = async (req, res) => {
    const { booking_id, ticket_id, amount, baggage_weights } = req.body;        // Recieve from frntend.

    if (!booking_id || !ticket_id) {
        return res.status(400).json({
            error: "Booking ID and Ticket ID are required"  // throw error
        });
    }

    const connection = await db.getConnection();    //database connection

    try {
        await connection.beginTransaction();  // transaction

        const transQuery = `
            INSERT INTO transactions
            (booking_id, payment_method_id, transaction_type_id, amount, transaction_datetime)                      
            VALUES (?, 1, 1, ?, NOW())
        `;

        const [transResult] = await connection.query(
            transQuery,
            [booking_id, amount || 0.00]
        );

        if (baggage_weights && Array.isArray(baggage_weights) && baggage_weights.length > 0) {

            const bagQuery = `
                INSERT INTO baggage 
                (ticket_id, baggage_status_id, weight, fee)                         
                VALUES (?, ?, ?, ?)
            `;

            const feePerBag = amount / baggage_weights.length;

            for (const weight of baggage_weights) {
                const numericWeight = parseFloat(weight);

                if (!isNaN(numericWeight) && numericWeight > 0) {
                    await connection.query(
                        bagQuery,
                        [ticket_id, 4, numericWeight, feePerBag]        // baggage status id 4 means at origin.
                    );
                }
            }
        }

        await connection.commit();              //save changes

        res.json({
            success: true,
            transactionId: transResult.insertId
        });

    } catch (err) {
        await connection.rollback();                                    //rollback changes in case of error
        console.error("TRANSACTION FAILED:", err.message);

        res.status(500).json({ error: err.message });

    } finally {
        connection.release();                   //release connection
    }
};

// Updates checked in status value for tickets, updates seat status to occupied. 
export const confirmCheckIn = async (req, res) => {
    try {
        const { ticket_id, seat_id, flight_instance_id } = req.body;

        await db.query(  //change checked in status to 1. 
            "UPDATE Tickets SET checked_in = 1 WHERE ticket_id = ?",
            [ticket_id]
        );

        res.json({ success: true });

    } catch (err) { 
        res.status(500).json({ error: "Update failed" });
    }
};