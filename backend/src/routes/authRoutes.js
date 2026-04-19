import { Router } from 'express';
import * as Auth from '../controllers/authController.js'; 

const router = Router();

router.post('/signup', (req, res) => Auth.signup(req, res));
router.post('/login', (req, res) => Auth.login(req, res));
router.put('/change-password', (req, res) => Auth.changePassword(req, res)); // necessary for force changing password feature

export default router;
