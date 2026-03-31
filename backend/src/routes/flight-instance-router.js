import { Router } from 'express';
import * as FlightController from '../controllers/flight-instance-controller.js';

const router = Router();

// Matches the comment in your controller
router.get('/search', FlightController.findFlights);

export default router;