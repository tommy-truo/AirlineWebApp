/* Abhishek Singh - empDashRoutes.js */
import express from 'express';
const router = express.Router();

import { 
    getDashboardFlights, 
    getAllAirports, 
    getPassengerDetailsByTicket,
    confirmCheckIn,
    createBaggageTransaction // 1. Import the new function
} from '../controllers/empDashController.js';

// Route Definitions
router.get('/airports', getAllAirports);
router.get('/dashboard-info', getDashboardFlights);
router.get('/checkin', getPassengerDetailsByTicket);
router.patch('/confirm-checkin', confirmCheckIn);

// 2. Add the POST route for transactions
// This must match the fetch URL in your frontend: /api/employee/create-transaction
router.post('/create-transaction', createBaggageTransaction);

export default router;