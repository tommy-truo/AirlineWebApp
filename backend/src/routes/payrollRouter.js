import { Router } from 'express';
import * as PayrollController from '../controllers/payrollController.js';

const router = Router();

router.get('/dropdowns', PayrollController.getPayrollDropdowns);
router.get('/reports', PayrollController.getPayrollReports);

export default router;