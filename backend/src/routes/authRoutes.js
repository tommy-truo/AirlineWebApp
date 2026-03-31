import { Router } from 'express';
import * as Auth from '../controllers/authController.js'; 

const router = Router();

router.post('/signup', (req, res) => Auth.signup(req, res));
router.post('/login', (req, res) => Auth.login(req, res));

export default router;