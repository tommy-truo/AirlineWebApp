// Written by Tommy Truong

import express from 'express';
import cors from 'cors';
import passengerRouter from './src/routes/passenger-router.js';
import bookingRouter from './src/routes/booking-router.js';
import flightRouter from './src/routes/flight-instance-router.js';
import authRouter from './src/routes/authRoutes.js';
import pilotRouter from './src/routes/pilotRouter.js';
// below added by aya
import employeeRouter from './src/routes/employeeRouter.js';
import transactionRouter from './src/routes/transactionRouter.js';
import payrollRouter from './src/routes/payrollRouter.js';
import shiftRequestRouter from './src/routes/shiftRequestRouter.js'
import assignmentRouter from './src/routes/assignmentRouter.js'
import flightReportRouter from './src/routes/flightReportRouter.js'

const app = express();
const PORT = process.env.PORT;

app.use(cors()); 

app.use(express.json()); 

//      ROUTES

app.use('/api/passengers', passengerRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/flights', flightRouter)
app.use('/api/auth', authRouter);
app.use('/api/pilot', pilotRouter);
// below added by aya
app.use('/api/employees', employeeRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/requests', shiftRequestRouter)
app.use('/api/assignments', assignmentRouter)
app.use('/api/flight-reports', flightReportRouter)

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
