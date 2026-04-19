import { Router } from 'express';
import { getAirports } from '../controllers/airportController.js';

const router = Router();

router.get('/', getAirports);

export default router;