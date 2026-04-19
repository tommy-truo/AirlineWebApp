import { db } from '../config/db.js';

export const getAirports = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT airport_id, iata, city
            FROM airports
            ORDER BY iata ASC
        `);

        res.status(200).json(rows);

    } catch (err) {
        console.error("GET AIRPORTS ERROR:", err);
        res.status(500).json({ message: "Error fetching airports." });
    }
};