import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  getDashboardStats,
  getAllBookings,
  createBookingForPatient,
  getAllPatients,
  deletePatient,
  getSettings,
  updateSettings,
  changeAdminPassword,
  exportBookingsCSV,
  exportPatientsCSV,
} from '../controllers/adminController';
import { logAudit } from '../middleware/auditLog';

const router = Router();

// Middleware pour toutes les routes admin : authentification + rôle admin
router.use(authenticate);
router.use(requireRole('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Gestion des rendez-vous
router.get('/bookings', getAllBookings);
router.post('/bookings', logAudit('CREATE_BOOKING_ADMIN'), createBookingForPatient);
router.get('/bookings/export/csv', exportBookingsCSV);

// Gestion des patients
router.get('/patients', getAllPatients);
router.delete('/patients/:id', logAudit('DELETE_PATIENT'), deletePatient);
router.get('/patients/export/csv', exportPatientsCSV);

// Paramètres
router.get('/settings', getSettings);
router.put('/settings', logAudit('UPDATE_SETTINGS'), updateSettings);

// Sécurité
router.put('/security/password', logAudit('CHANGE_PASSWORD'), changeAdminPassword);

export default router;
