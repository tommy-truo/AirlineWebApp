import { searchFlights } from '../models/flight-instance-model.js';

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