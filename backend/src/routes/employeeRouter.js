import { Router } from 'express';
import * as Employee from '../controllers/employeeController.js';

const router = Router();

router.get('/', (req, res) => Employee.getAllEmployees(req, res));
router.post('/', (req, res) => Employee.createEmployee(req, res));
router.put('/:id', (req, res) => Employee.updateEmployee(req, res));
router.delete('/:id', (req, res) => Employee.deleteEmployee(req, res));

export default router;