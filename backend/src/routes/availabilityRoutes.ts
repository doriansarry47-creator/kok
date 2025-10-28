import { Router } from 'express';
import {
  createAvailability,
  getAvailabilities,
  updateAvailability,
  deleteAvailability,
  createException,
  getExceptions,
  deleteException,
  getAvailableSlots,
} from '../controllers/availabilityController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, availabilitySchema, exceptionSchema } from '../middleware/validation';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// Routes publiques (ou authentifiées pour les patients)
router.get('/slots', authenticate, getAvailableSlots);
router.get('/', authenticate, getAvailabilities);

// Routes admin uniquement
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(availabilitySchema),
  auditLog('CREATE', 'AVAILABILITY'),
  createAvailability
);

router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  auditLog('UPDATE', 'AVAILABILITY'),
  updateAvailability
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  auditLog('DELETE', 'AVAILABILITY'),
  deleteAvailability
);

// Exceptions (congés, ouvertures exceptionnelles)
router.get('/exceptions', authenticate, requireRole('admin'), getExceptions);

router.post(
  '/exceptions',
  authenticate,
  requireRole('admin'),
  validate(exceptionSchema),
  auditLog('CREATE', 'EXCEPTION'),
  createException
);

router.delete(
  '/exceptions/:id',
  authenticate,
  requireRole('admin'),
  auditLog('DELETE', 'EXCEPTION'),
  deleteException
);

export default router;
