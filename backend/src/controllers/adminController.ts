import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest, BookingWithUser } from '../types';
import logger from '../config/logger';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * Tableau de bord administrateur
 * Statistiques générales pour le dashboard
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const client = await pool.connect();

    try {
      // Nombre total de patients
      const patientsResult = await client.query(
        'SELECT COUNT(*) as count FROM users WHERE role = $1 AND is_active = true',
        ['patient']
      );

      // Prochains rendez-vous (7 jours)
      const upcomingBookingsResult = await client.query(
        `SELECT COUNT(*) as count FROM bookings 
         WHERE date >= CURRENT_DATE 
         AND date <= CURRENT_DATE + INTERVAL '7 days'
         AND status NOT IN ('cancelled')`,
        []
      );

      // Rendez-vous aujourd'hui
      const todayBookingsResult = await client.query(
        `SELECT b.*, u.email as patient_email, u.first_name as patient_first_name, 
                u.last_name as patient_last_name, u.phone as patient_phone
         FROM bookings b
         JOIN users u ON b.patient_id = u.id
         WHERE b.date = CURRENT_DATE AND b.status NOT IN ('cancelled')
         ORDER BY b.start_time`,
        []
      );

      // Annulations récentes (7 derniers jours)
      const recentCancellationsResult = await client.query(
        `SELECT COUNT(*) as count FROM bookings 
         WHERE status = 'cancelled' 
         AND cancelled_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'`,
        []
      );

      res.json({
        success: true,
        data: {
          totalPatients: parseInt(patientsResult.rows[0].count),
          upcomingBookings: parseInt(upcomingBookingsResult.rows[0].count),
          todayBookings: todayBookingsResult.rows,
          recentCancellations: parseInt(recentCancellationsResult.rows[0].count),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
    });
  }
};

/**
 * Liste tous les rendez-vous avec filtres
 */
export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { status, date_from, date_to, patient_id } = req.query;

    const client = await pool.connect();

    try {
      let query = `
        SELECT b.*, 
               u.email as patient_email, 
               u.first_name as patient_first_name,
               u.last_name as patient_last_name, 
               u.phone as patient_phone
        FROM bookings b
        JOIN users u ON b.patient_id = u.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (status) {
        query += ` AND b.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (date_from) {
        query += ` AND b.date >= $${paramIndex}`;
        params.push(date_from);
        paramIndex++;
      }

      if (date_to) {
        query += ` AND b.date <= $${paramIndex}`;
        params.push(date_to);
        paramIndex++;
      }

      if (patient_id) {
        query += ` AND b.patient_id = $${paramIndex}`;
        params.push(patient_id);
        paramIndex++;
      }

      query += ' ORDER BY b.date DESC, b.start_time DESC';

      const result = await client.query(query, params);

      res.json({
        success: true,
        data: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Erreur lors de la récupération des rendez-vous', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rendez-vous',
    });
  }
};

/**
 * Créer un rendez-vous pour un patient (admin)
 */
export const createBookingForPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, date, start_time, end_time, reason } = req.body;

    if (!patient_id || !date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes',
      });
    }

    const client = await pool.connect();

    try {
      // Vérifier que le patient existe
      const patientCheck = await client.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [patient_id, 'patient']
      );

      if (patientCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Patient non trouvé',
        });
      }

      // Vérifier disponibilité
      const conflictCheck = await client.query(
        `SELECT id FROM bookings 
         WHERE date = $1 
         AND status NOT IN ('cancelled')
         AND (
           (start_time <= $2 AND end_time > $2) OR
           (start_time < $3 AND end_time >= $3) OR
           (start_time >= $2 AND end_time <= $3)
         )`,
        [date, start_time, end_time]
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Ce créneau est déjà réservé',
        });
      }

      // Créer le rendez-vous
      const bookingId = uuidv4();
      const result = await client.query(
        `INSERT INTO bookings (id, patient_id, date, start_time, end_time, status, reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [bookingId, patient_id, date, start_time, end_time, 'confirmed', reason || null]
      );

      // Log d'audit
      await client.query(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          req.user?.id,
          'CREATE_BOOKING_ADMIN',
          'booking',
          bookingId,
          JSON.stringify({ patient_id, date, start_time }),
          req.ip,
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Rendez-vous créé avec succès',
        data: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Erreur lors de la création du rendez-vous', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du rendez-vous',
    });
  }
};

/**
 * Liste tous les patients
 */
export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;

    const client = await pool.connect();

    try {
      let query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, 
               u.created_at, u.last_login, u.is_active,
               COUNT(b.id) as total_bookings
        FROM users u
        LEFT JOIN bookings b ON u.id = b.patient_id
        WHERE u.role = 'patient'
      `;

      const params: any[] = [];

      if (search) {
        query += ` AND (
          u.email ILIKE $1 OR 
          u.first_name ILIKE $1 OR 
          u.last_name ILIKE $1 OR
          u.phone ILIKE $1
        )`;
        params.push(`%${search}%`);
      }

      query += ' GROUP BY u.id ORDER BY u.created_at DESC';

      const result = await client.query(query, params);

      res.json({
        success: true,
        data: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Erreur lors de la récupération des patients', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des patients',
    });
  }
};

/**
 * Supprimer un patient
 */
export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();

    try {
      // Vérifier que l'utilisateur existe et est un patient
      const userCheck = await client.query(
        'SELECT id, email FROM users WHERE id = $1 AND role = $2',
        [id, 'patient']
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Patient non trouvé',
        });
      }

      // Supprimer l'utilisateur (cascade sur bookings)
      await client.query('DELETE FROM users WHERE id = $1', [id]);

      // Log d'audit
      await client.query(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          req.user?.id,
          'DELETE_PATIENT',
          'user',
          id,
          JSON.stringify({ email: userCheck.rows[0].email }),
          req.ip,
        ]
      );

      res.json({
        success: true,
        message: 'Patient supprimé avec succès',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Erreur lors de la suppression du patient', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du patient',
    });
  }
};

/**
 * Obtenir les paramètres du cabinet
 */
export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const client = await pool.connect();

    try {
      const result = await client.query('SELECT * FROM cabinet_settings LIMIT 1');

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Paramètres non trouvés',
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Erreur lors de la récupération des paramètres', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres',
    });
  }
};

/**
 * Mettre à jour les paramètres du cabinet
 */
export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      cabinet_name,
      address,
      contact_email,
      contact_phone,
      logo_url,
      notification_enabled,
      reminder_days_before,
      allow_online_booking,
      slot_duration_default,
    } = req.body;

    const client = await pool.connect();

    try {
      // Récupérer l'ID des paramètres existants
      const existingSettings = await client.query('SELECT id FROM cabinet_settings LIMIT 1');

      if (existingSettings.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Paramètres non trouvés',
        });
      }

      const settingsId = existingSettings.rows[0].id;

      // Construire la requête de mise à jour dynamiquement
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (cabinet_name !== undefined) {
        updates.push(`cabinet_name = $${paramIndex}`);
        params.push(cabinet_name);
        paramIndex++;
      }
      if (address !== undefined) {
        updates.push(`address = $${paramIndex}`);
        params.push(address);
        paramIndex++;
      }
      if (contact_email !== undefined) {
        updates.push(`contact_email = $${paramIndex}`);
        params.push(contact_email);
        paramIndex++;
      }
      if (contact_phone !== undefined) {
        updates.push(`contact_phone = $${paramIndex}`);
        params.push(contact_phone);
        paramIndex++;
      }
      if (logo_url !== undefined) {
        updates.push(`logo_url = $${paramIndex}`);
        params.push(logo_url);
        paramIndex++;
      }
      if (notification_enabled !== undefined) {
        updates.push(`notification_enabled = $${paramIndex}`);
        params.push(notification_enabled);
        paramIndex++;
      }
      if (reminder_days_before !== undefined) {
        updates.push(`reminder_days_before = $${paramIndex}`);
        params.push(reminder_days_before);
        paramIndex++;
      }
      if (allow_online_booking !== undefined) {
        updates.push(`allow_online_booking = $${paramIndex}`);
        params.push(allow_online_booking);
        paramIndex++;
      }
      if (slot_duration_default !== undefined) {
        updates.push(`slot_duration_default = $${paramIndex}`);
        params.push(slot_duration_default);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucune donnée à mettre à jour',
        });
      }

      params.push(settingsId);
      const query = `UPDATE cabinet_settings SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const result = await client.query(query, params);

      // Log d'audit
      await client.query(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          req.user?.id,
          'UPDATE_SETTINGS',
          'cabinet_settings',
          settingsId,
          JSON.stringify(req.body),
          req.ip,
        ]
      );

      res.json({
        success: true,
        message: 'Paramètres mis à jour avec succès',
        data: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des paramètres', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres',
    });
  }
};

/**
 * Changer le mot de passe admin
 */
export const changeAdminPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Mots de passe requis',
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
      });
    }

    const client = await pool.connect();

    try {
      // Récupérer l'utilisateur admin
      const userResult = await client.query('SELECT * FROM users WHERE id = $1', [req.user?.id]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      const user = userResult.rows[0];

      // Vérifier le mot de passe actuel
      const isValidPassword = await bcrypt.compare(current_password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe actuel incorrect',
        });
      }

      // Hasher le nouveau mot de passe
      const newPasswordHash = await bcrypt.hash(new_password, 12);

      // Mettre à jour le mot de passe
      await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
        newPasswordHash,
        req.user?.id,
      ]);

      // Log d'audit
      await client.query(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), req.user?.id, 'CHANGE_PASSWORD', 'user', req.user?.id, req.ip]
      );

      res.json({
        success: true,
        message: 'Mot de passe modifié avec succès',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Erreur lors du changement de mot de passe', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
    });
  }
};

/**
 * Export des rendez-vous en CSV
 */
export const exportBookingsCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { date_from, date_to } = req.query;

    const client = await pool.connect();

    try {
      let query = `
        SELECT b.date, b.start_time, b.end_time, b.status, b.reason,
               u.first_name, u.last_name, u.email, u.phone
        FROM bookings b
        JOIN users u ON b.patient_id = u.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (date_from) {
        query += ` AND b.date >= $${paramIndex}`;
        params.push(date_from);
        paramIndex++;
      }

      if (date_to) {
        query += ` AND b.date <= $${paramIndex}`;
        params.push(date_to);
        paramIndex++;
      }

      query += ' ORDER BY b.date, b.start_time';

      const result = await client.query(query, params);

      // Générer le CSV
      let csv = 'Date,Heure début,Heure fin,Statut,Patient prénom,Patient nom,Email,Téléphone,Motif\n';

      result.rows.forEach((row) => {
        csv += `${row.date},${row.start_time},${row.end_time},${row.status},"${row.first_name || ''}","${row.last_name || ''}","${row.email}","${row.phone || '"}","${row.reason || ''}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=rendez-vous.csv');
      res.send(csv);
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error("Erreur lors de l'export CSV", { error });
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'export CSV",
    });
  }
};

/**
 * Export des patients en CSV
 */
export const exportPatientsCSV = async (req: AuthRequest, res: Response) => {
  try {
    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT u.email, u.first_name, u.last_name, u.phone, u.created_at,
                COUNT(b.id) as total_bookings
         FROM users u
         LEFT JOIN bookings b ON u.id = b.patient_id
         WHERE u.role = 'patient' AND u.is_active = true
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );

      // Générer le CSV
      let csv = 'Email,Prénom,Nom,Téléphone,Date inscription,Nombre RDV\n';

      result.rows.forEach((row) => {
        csv += `"${row.email}","${row.first_name || ''}","${row.last_name || ''}","${row.phone || ''}","${row.created_at}",${row.total_bookings}\n`;
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=patients.csv');
      res.send(csv);
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error("Erreur lors de l'export CSV des patients", { error });
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'export CSV",
    });
  }
};
