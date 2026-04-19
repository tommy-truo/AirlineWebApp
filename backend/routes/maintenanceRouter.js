import { Router } from 'express';
import {
  getAircraftInMaintenance,
  beginService,
  markBroken,
  markActive,
  getTasks,
  completeTask,
  submitLog,
  getLogs,
  submitIssue,
  getIssues,
  getSummary
} from '../controllers/maintenanceController.js';

const router = Router();

router.get('/aircraft', getAircraftInMaintenance);
router.put('/aircraft/:id/begin-service', beginService);
router.put('/aircraft/:id/mark-broken', markBroken);
router.put('/aircraft/:id/mark-active', markActive);
router.get('/tasks', getTasks);
router.put('/tasks/:id/complete', completeTask);
router.post('/logs', submitLog);
router.get('/logs', getLogs);
router.post('/issues', submitIssue);
router.get('/issues', getIssues);
router.get('/summary', getSummary);

export default router;
