import { Router } from 'express';
import { register, login, verifyEmail } from '../controllers/authController';

const router = Router();

// Registration Route
router.post('/register', register);

// Login Route
router.post('/login', login);

// Email Verification Route
router.post('/verify-email', verifyEmail);

export default router;