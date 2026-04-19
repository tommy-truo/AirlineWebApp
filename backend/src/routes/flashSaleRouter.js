import { Router } from 'express';
import * as FlashSaleController from '../controllers/flashSaleController.js';

const router = Router();

router.get('/', FlashSaleController.getFlashSales);
router.post('/', FlashSaleController.createFlashSale);
router.put('/:id/status', FlashSaleController.toggleFlashSaleStatus);
router.delete('/:id', FlashSaleController.deleteFlashSale);

export default router;