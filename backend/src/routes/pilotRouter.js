import express from 'express';
import {
  getShiftCalendar,
  submitShiftRequest,
  getScheduledFlights,
  getShiftRequests,
  getProfile,
  updateProfile,
  getCrewManifest,
  updateEmergencyContact
} from '../controllers/pilotController.js';

const router = express.Router();

// Shift Calendar
router.get('/shift_calendar', getShiftCalendar);

// add, swap, drop shifts
router.post('/submit_request', submitShiftRequest);

// scheduled flights
router.get('/scheduled_flights', getScheduledFlights);

// to see shift requests
router.get('/shift_requests', getShiftRequests);

// personal info / HR
router.get('/profile', getProfile);

// updating basic contact info
router.put('/profile', updateProfile);

//crew manifest
router.get('/crew_manifest', getCrewManifest);

// updates for emergency contact only
router.put('/profile/emergency-contact', updateEmergencyContact);

export default router;