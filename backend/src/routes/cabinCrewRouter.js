import express from 'express';
import {
  getCabinCrewShiftCalendar,
  submitCabinCrewShiftRequest,
  getCabinCrewShiftRequests,
  getCabinCrewScheduledFlights,
  getCabinCrewProfile,
  updateCabinCrewProfile,
  updateCabinCrewEmergencyContact,
  getCabinCrewManifest,
  getCabinCrewFlightReports,
  getCabinCrewPendingFlightReports,
  submitCabinCrewFlightReport,
  getCabinCrewFlightReportDetails

} from '../controllers/cabinCrewController.js';

const router = express.Router();

router.get('/shift_calendar', getCabinCrewShiftCalendar);
// add, swap, drop shifts
router.post('/submit_request', submitCabinCrewShiftRequest);
router.get('/shift_requests', getCabinCrewShiftRequests);
router.get('/scheduled_flights', getCabinCrewScheduledFlights);
router.get('/profile', getCabinCrewProfile);
router.get('/profile', updateCabinCrewProfile);
router.put('/profile/emergency-contact', updateCabinCrewEmergencyContact);
router.get('/crew_manifest', getCabinCrewManifest);
router.put('/profile/emergency-contact', updateCabinCrewEmergencyContact);
router.get('/flight_reports', getCabinCrewFlightReports);
router.get('/flight_reports/pending', getCabinCrewPendingFlightReports);
router.post('/flight_reports', submitCabinCrewFlightReport);
router.get('/flight_reports/:reportId', getCabinCrewFlightReportDetails);

export default router;