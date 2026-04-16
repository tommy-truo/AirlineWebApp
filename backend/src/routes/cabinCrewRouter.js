import express from 'express';
import {
  getCabinCrewShiftCalendar,
  getCabinCrewScheduledFlights,
  getCabinCrewProfile,
  updateCabinCrewEmergencyContact,
  getCabinCrewManifest
} from '../controllers/cabinCrewController.js';

const router = express.Router();

router.get('/shift_calendar', getCabinCrewShiftCalendar);
router.get('/scheduled_flights', getCabinCrewScheduledFlights);
router.get('/profile', getCabinCrewProfile);
router.put('/profile/emergency-contact', updateCabinCrewEmergencyContact);
router.get('/crew_manifest', getCabinCrewManifest);

export default router;