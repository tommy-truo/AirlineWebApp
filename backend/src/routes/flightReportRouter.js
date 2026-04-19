import { Router } from 'express'
import {
  getFlightReport,
  getFlightReportDropdowns
} from '../controllers/flightReportController.js'

const router = Router()

router.get('/dropdowns', getFlightReportDropdowns)
router.get('/', getFlightReport)

export default router