import { Router } from 'express';
import * as TransactionController from '../controllers/transactionController.js';

const router = Router();

router.get('/', TransactionController.getAllTransactions);
router.get('/dropdowns', TransactionController.getTransactionDropdowns);
router.get('/reports', TransactionController.getTransactionReports);

export default router;