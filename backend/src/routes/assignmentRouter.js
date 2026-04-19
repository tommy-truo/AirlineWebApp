import { Router } from 'express'
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
  getAssignmentTypes
} from '../controllers/assignmentController.js'

const router = Router()

router.get('/', getAssignments)
router.post('/', createAssignment)
router.delete('/:id', deleteAssignment)
router.get('/types', getAssignmentTypes)

export default router
