import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getAllBookings,
  createBookingForPatient,
} from '../controllers/bookingController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, bookingSchema, updateBookingSchema } from '../middleware/validation';
import { bookingLimiter } from '../middleware/rateLimiter';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// Routes patient
router.post(
  '/',
  authenticate,
  requireRole('patient'),
  bookingLimiter,
  validate(bookingSchema),
  auditLog('CREATE', 'BOOKING'),
  createBooking
);

router.get('/my', authenticate, requireRole('patient'), getMyBookings);

router.get('/:id', authenticate, getBooking);

router.put(
  '/:id',
  authenticate,
  validate(updateBookingSchema),
  auditLog('UPDATE', 'BOOKING'),
  updateBooking
);

router.post('/:id/cancel', authenticate, auditLog('CANCEL', 'BOOKING'), cancelBooking);

// Routes admin
router.get('/', authenticate, requireRole('admin'), getAllBookings);

router.post(
  '/admin/create',
  authenticate,
  requireRole('admin'),
  validate(bookingSchema),
  auditLog('CREATE', 'BOOKING'),
  createBookingForPatient
);

export default router;
