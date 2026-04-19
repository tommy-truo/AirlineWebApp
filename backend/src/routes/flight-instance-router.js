import { Router } from 'express';
import * as FlightController from '../controllers/flight-instance-controller.js';

const router = Router();

router.get('/search', FlightController.findFlights);
router.get('/:flightInstanceId/seats', FlightController.fetchFlightSeats);

// added by aya
router.get('/dropdowns', FlightController.getDropdownData);
router.post('/create', FlightController.createFlight);
router.get('/all', FlightController.getAllFlights);
router.put('/:id', FlightController.updateFlight);

export default router;
