import { Router } from 'express';
import * as FlightController from '../controllers/flight-instance-controller.js';

const router = Router();

// Matches the comment in your controller
router.get('/search', FlightController.findFlights);

// added by aya
router.get('/dropdowns', FlightController.getDropdownData);
router.post('/create', FlightController.createFlight);
router.get('/all', FlightController.getAllFlights);

export default router;
