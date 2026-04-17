import express from 'express';
import {
  getCabinCrewShiftCalendar,
  submitCabinCrewShiftRequest,
  getCabinCrewShiftRequests,
  getCabinCrewScheduledFlights,
  getCabinCrewProfile,
  updateCabinCrewEmergencyContact,
  getCabinCrewManifest
} from '../controllers/cabinCrewController.js';

const router = express.Router();

router.get('/shift_calendar', getCabinCrewShiftCalendar);
router.post('/submit_request', submitCabinCrewShiftRequest);
router.get('/shift_requests', getCabinCrewShiftRequests);
router.get('/scheduled_flights', getCabinCrewScheduledFlights);
router.get('/profile', getCabinCrewProfile);
router.put('/profile/emergency-contact', updateCabinCrewEmergencyContact);
router.get('/crew_manifest', getCabinCrewManifest);

export default router;