import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { AuthRequest, BookingWithUser } from '../types';
import logger from '../config/logger';
import {
  sendBookingConfirmation,
  sendBookingCancellation,
} from '../services/emailService';
import { differenceInHours } from 'date-fns';

// Créer une réservation
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { date, start_time, end_time, reason } = req.body;
    const patient_id = req.user!.id;

    // Vérifier que le créneau n'est pas déjà réservé
    const existingBooking = await query(
      `SELECT id FROM bookings 
       WHERE date = $1 AND start_time = $2 AND status IN ('confirmed', 'pending')`,
      [date, start_time]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ce créneau est déjà réservé',
      });
    }

    // Vérifier que le patient n'a pas déjà un rendez-vous à cette date
    const patientBooking = await query(
      `SELECT id FROM bookings 
       WHERE patient_id = $1 AND date = $2 AND status IN ('confirmed', 'pending')`,
      [patient_id, date]
    );

    if (patientBooking.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Vous avez déjà un rendez-vous prévu ce jour-là',
      });
    }

    const id = uuidv4();

    // Créer la réservation
    await query(
      `INSERT INTO bookings (id, patient_id, date, start_time, end_time, status, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, patient_id, date, start_time, end_time, 'confirmed', reason]
    );

    // Récupérer les informations complètes
    const bookingResult = await query(
      `SELECT b.*, u.email as patient_email, u.first_name as patient_first_name, 
              u.last_name as patient_last_name, u.phone as patient_phone
       FROM bookings b
       JOIN users u ON b.patient_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    const booking: BookingWithUser = bookingResult.rows[0];

    // Envoyer l'email de confirmation
    try {
      await sendBookingConfirmation(booking);
    } catch (emailError) {
      logger.error('Erreur envoi email confirmation', { error: emailError });
      // Ne pas bloquer la réservation si l'email échoue
    }

    logger.info('Réservation créée', { id, patient_id, date });

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: booking,
    });
  } catch (error) {
    logger.error('Erreur lors de la création de réservation', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Récupérer les réservations de l'utilisateur connecté
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const patient_id = req.user!.id;

    const result = await query(
      `SELECT * FROM bookings 
       WHERE patient_id = $1 
       ORDER BY date DESC, start_time DESC`,
      [patient_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des réservations', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Récupérer une réservation spécifique
export const getBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let result;

    if (userRole === 'admin') {
      result = await query(
        `SELECT b.*, u.email as patient_email, u.first_name as patient_first_name, 
                u.last_name as patient_last_name, u.phone as patient_phone
         FROM bookings b
         JOIN users u ON b.patient_id = u.id
         WHERE b.id = $1`,
        [id]
      );
    } else {
      result = await query('SELECT * FROM bookings WHERE id = $1 AND patient_id = $2', [
        id,
        userId,
      ]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de la réservation', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Modifier une réservation
export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date, start_time, end_time, reason } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Récupérer la réservation
    const bookingResult = await query(
      `SELECT b.*, u.email as patient_email, u.first_name as patient_first_name
       FROM bookings b
       JOIN users u ON b.patient_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    const booking = bookingResult.rows[0];

    // Vérifier les permissions
    if (userRole === 'patient' && booking.patient_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
      });
    }

    // Vérifier le délai de modification (24h minimum)
    if (userRole === 'patient') {
      const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
      const hoursUntilBooking = differenceInHours(bookingDateTime, new Date());

      if (hoursUntilBooking < 24) {
        return res.status(400).json({
          success: false,
          message:
            'Les modifications doivent être effectuées au moins 24 heures avant le rendez-vous',
        });
      }
    }

    // Mettre à jour la réservation
    await query(
      `UPDATE bookings 
       SET date = COALESCE($1, date),
           start_time = COALESCE($2, start_time),
           end_time = COALESCE($3, end_time),
           reason = COALESCE($4, reason),
           updated_at = NOW()
       WHERE id = $5`,
      [date, start_time, end_time, reason, id]
    );

    logger.info('Réservation modifiée', { id, userId });

    res.json({
      success: true,
      message: 'Réservation modifiée avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la modification de réservation', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Annuler une réservation
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Récupérer la réservation
    const bookingResult = await query(
      `SELECT b.*, u.email as patient_email, u.first_name as patient_first_name, 
              u.last_name as patient_last_name, u.phone as patient_phone
       FROM bookings b
       JOIN users u ON b.patient_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    const booking: BookingWithUser = bookingResult.rows[0];

    // Vérifier les permissions
    if (userRole === 'patient' && booking.patient_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
      });
    }

    // Vérifier le délai d'annulation (24h minimum)
    if (userRole === 'patient') {
      const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
      const hoursUntilBooking = differenceInHours(bookingDateTime, new Date());

      if (hoursUntilBooking < 24) {
        return res.status(400).json({
          success: false,
          message:
            'Les annulations doivent être effectuées au moins 24 heures avant le rendez-vous',
        });
      }
    }

    // Annuler la réservation
    await query(
      `UPDATE bookings 
       SET status = 'cancelled',
           cancelled_at = NOW(),
           cancellation_reason = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [cancellation_reason, id]
    );

    // Envoyer l'email d'annulation
    try {
      booking.cancellation_reason = cancellation_reason;
      await sendBookingCancellation(booking, userRole === 'admin' ? 'admin' : 'patient');
    } catch (emailError) {
      logger.error('Erreur envoi email annulation', { error: emailError });
    }

    logger.info('Réservation annulée', { id, userId });

    res.json({
      success: true,
      message: 'Réservation annulée avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de l\'annulation de réservation', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Admin : Récupérer toutes les réservations
export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { status, start_date, end_date } = req.query;

    let queryText = `
      SELECT b.*, u.email as patient_email, u.first_name as patient_first_name, 
             u.last_name as patient_last_name, u.phone as patient_phone
      FROM bookings b
      JOIN users u ON b.patient_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (start_date) {
      queryText += ` AND b.date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      queryText += ` AND b.date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    queryText += ' ORDER BY b.date DESC, b.start_time DESC';

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de toutes les réservations', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Admin : Créer une réservation pour un patient
export const createBookingForPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, date, start_time, end_time, reason } = req.body;

    // Vérifier que le patient existe
    const patientResult = await query('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [
      patient_id,
    ]);

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé',
      });
    }

    // Vérifier que le créneau n'est pas déjà réservé
    const existingBooking = await query(
      `SELECT id FROM bookings 
       WHERE date = $1 AND start_time = $2 AND status IN ('confirmed', 'pending')`,
      [date, start_time]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ce créneau est déjà réservé',
      });
    }

    const id = uuidv4();

    await query(
      `INSERT INTO bookings (id, patient_id, date, start_time, end_time, status, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, patient_id, date, start_time, end_time, 'confirmed', reason]
    );

    logger.info('Réservation créée par admin', { id, patient_id, adminId: req.user!.id });

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: { id, patient_id, date, start_time, end_time },
    });
  } catch (error) {
    logger.error('Erreur lors de la création de réservation par admin', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};
