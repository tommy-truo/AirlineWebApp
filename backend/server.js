// Written by Tommy Truong

import express from 'express';
import cors from 'cors';
import passengerRouter from './src/routes/passenger-router.js';
import bookingRouter from './src/routes/booking-router.js';
import flightRouter from './src/routes/flight-instance-router.js';
import authRouter from './src/routes/authRoutes.js';
import pilotRouter from './src/routes/pilotRouter.js';
import maintenanceRouter from './routes/maintenanceRouter.js';
import cabinRouter from './routes/cabinRouter.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors()); 

app.use(express.json()); 

//      ROUTES

app.use('/api/passengers', passengerRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/flights', flightRouter)
app.use('/api/auth', authRouter);
app.use('/api/pilot', pilotRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/cabin-brief', cabinRouter);

app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ 
        message: "Internal Server Error", 
        error: err.message 
    });
});

//      START SERVER 
app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running at https://airlinewebapp.onrender.com`);
});

export default app;
