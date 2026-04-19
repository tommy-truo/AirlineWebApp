import express from 'express';
import { getCabinBrief } from '../controllers/cabinController.js';

const router = express.Router();

// GET /api/cabin-brief/flight/:flightInstanceId — passenger counts per cabin class
router.get('/flight/:flightInstanceId', getCabinBrief);

export default router;
