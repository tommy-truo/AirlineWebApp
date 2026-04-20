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
  getCabinCrewFlightReportDetails,
  getCabinCrewSwapOptions,
  getEmployeeNotificationsController,
  readEmployeeNotificationController,
  reviewShiftRequest

} from '../controllers/cabinCrewController.js';

const router = express.Router();

router.get('/shift_calendar', getCabinCrewShiftCalendar);
router.post('/submit_request', submitCabinCrewShiftRequest);
router.get('/shift_requests', getCabinCrewShiftRequests);
router.put('/shift_requests/:requestId/review', reviewShiftRequest);

router.get('/scheduled_flights', getCabinCrewScheduledFlights);

router.get('/profile', getCabinCrewProfile);
router.put('/profile', updateCabinCrewProfile);
router.put('/profile/emergency-contact', updateCabinCrewEmergencyContact);

router.get('/crew_manifest', getCabinCrewManifest);

router.get('/flight_reports', getCabinCrewFlightReports);
router.get('/flight_reports/pending', getCabinCrewPendingFlightReports);
router.post('/flight_reports', submitCabinCrewFlightReport);
router.get('/flight_reports/:reportId', getCabinCrewFlightReportDetails);

router.get('/swap_options', getCabinCrewSwapOptions);

router.get('/employees/:employeeId/notifications', getEmployeeNotificationsController);
router.patch('/employees/notifications/:notificationId/read', readEmployeeNotificationController);

export default router;