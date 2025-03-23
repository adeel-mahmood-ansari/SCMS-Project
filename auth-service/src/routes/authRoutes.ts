import { Router } from 'express';
import { register, login, verify } from '../controllers/authController';

const router = Router();

// Registration Route
router.post('/register', register);

// Login Route
router.post('/login', login);

// Email Verification Route
router.get('/verify/:token', verify);

export default router;