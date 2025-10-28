import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  deleteAccount,
  exportData,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate, registerSchema, loginSchema, updateProfileSchema } from '../middleware/validation';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// Routes publiques
router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);

// Routes protégées
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, validate(updateProfileSchema), auditLog('UPDATE', 'USER'), updateProfile);
router.delete('/me', authenticate, auditLog('DELETE', 'USER'), deleteAccount);
router.get('/me/export', authenticate, exportData);

export default router;
