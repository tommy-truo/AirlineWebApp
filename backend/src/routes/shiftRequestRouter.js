import { Router } from 'express'
import {
  getAllRequests,
  updateRequestStatus
} from '../controllers/shiftRequestController.js'

const router = Router()

router.get('/', getAllRequests)
router.put('/:id', updateRequestStatus)

export default router