import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import logger from '../config/logger';
import { addDays, format, startOfWeek } from 'date-fns';

// Créer une plage horaire récurrente
export const createAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { day_of_week, start_time, end_time, slot_duration } = req.body;

    const id = uuidv4();

    await query(
      `INSERT INTO availabilities (id, day_of_week, start_time, end_time, slot_duration, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, day_of_week, start_time, end_time, slot_duration, true]
    );

    logger.info('Disponibilité créée', { id, day_of_week });

    res.status(201).json({
      success: true,
      message: 'Disponibilité créée avec succès',
      data: { id, day_of_week, start_time, end_time, slot_duration },
    });
  } catch (error) {
    logger.error('Erreur lors de la création de disponibilité', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Récupérer toutes les disponibilités
export const getAvailabilities = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM availabilities WHERE is_active = true ORDER BY day_of_week, start_time'
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des disponibilités', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Mettre à jour une disponibilité
export const updateAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { day_of_week, start_time, end_time, slot_duration, is_active } = req.body;

    await query(
      `UPDATE availabilities 
       SET day_of_week = COALESCE($1, day_of_week),
           start_time = COALESCE($2, start_time),
           end_time = COALESCE($3, end_time),
           slot_duration = COALESCE($4, slot_duration),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       WHERE id = $6`,
      [day_of_week, start_time, end_time, slot_duration, is_active, id]
    );

    logger.info('Disponibilité mise à jour', { id });

    res.json({
      success: true,
      message: 'Disponibilité mise à jour avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de disponibilité', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Supprimer une disponibilité
export const deleteAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM availabilities WHERE id = $1', [id]);

    logger.info('Disponibilité supprimée', { id });

    res.json({
      success: true,
      message: 'Disponibilité supprimée avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de disponibilité', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Créer une exception (congé ou ouverture exceptionnelle)
export const createException = async (req: AuthRequest, res: Response) => {
  try {
    const { date, start_time, end_time, is_available, reason } = req.body;

    const id = uuidv4();

    await query(
      `INSERT INTO exceptions (id, date, start_time, end_time, is_available, reason)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, date, start_time, end_time, is_available, reason]
    );

    logger.info('Exception créée', { id, date, is_available });

    res.status(201).json({
      success: true,
      message: 'Exception créée avec succès',
      data: { id, date, is_available },
    });
  } catch (error) {
    logger.error('Erreur lors de la création d\'exception', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Récupérer les exceptions
export const getExceptions = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM exceptions ORDER BY date');

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des exceptions', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Supprimer une exception
export const deleteException = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM exceptions WHERE id = $1', [id]);

    logger.info('Exception supprimée', { id });

    res.json({
      success: true,
      message: 'Exception supprimée avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression d\'exception', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Récupérer les créneaux disponibles pour une période
export const getAvailableSlots = async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de début et de fin sont requises',
      });
    }

    // Récupérer les disponibilités actives
    const availabilities = await query(
      'SELECT * FROM availabilities WHERE is_active = true'
    );

    // Récupérer les exceptions
    const exceptions = await query(
      'SELECT * FROM exceptions WHERE date BETWEEN $1 AND $2',
      [start_date, end_date]
    );

    // Récupérer les réservations existantes
    const bookings = await query(
      `SELECT date, start_time, end_time FROM bookings 
       WHERE date BETWEEN $1 AND $2 AND status IN ('confirmed', 'pending')`,
      [start_date, end_date]
    );

    // Générer les créneaux disponibles
    const slots: any[] = [];
    let currentDate = new Date(start_date as string);
    const endDate = new Date(end_date as string);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = format(currentDate, 'yyyy-MM-dd');

      // Vérifier s'il y a une exception pour ce jour
      const exception = exceptions.rows.find(
        (e) => format(new Date(e.date), 'yyyy-MM-dd') === dateStr
      );

      if (exception && !exception.is_available) {
        // Jour de congé
        currentDate = addDays(currentDate, 1);
        continue;
      }

      // Récupérer les disponibilités pour ce jour
      const dayAvailabilities = availabilities.rows.filter(
        (a) => a.day_of_week === dayOfWeek
      );

      for (const availability of dayAvailabilities) {
        const { start_time, end_time, slot_duration } = availability;

        // Générer les créneaux
        const [startHour, startMin] = start_time.split(':').map(Number);
        const [endHour, endMin] = end_time.split(':').map(Number);

        let currentSlotStart = startHour * 60 + startMin;
        const endSlotTime = endHour * 60 + endMin;

        while (currentSlotStart + slot_duration <= endSlotTime) {
          const slotStartTime = `${Math.floor(currentSlotStart / 60)
            .toString()
            .padStart(2, '0')}:${(currentSlotStart % 60).toString().padStart(2, '0')}`;
          const slotEndTime = `${Math.floor((currentSlotStart + slot_duration) / 60)
            .toString()
            .padStart(2, '0')}:${((currentSlotStart + slot_duration) % 60)
            .toString()
            .padStart(2, '0')}`;

          // Vérifier si le créneau est déjà réservé
          const isBooked = bookings.rows.some(
            (b) =>
              format(new Date(b.date), 'yyyy-MM-dd') === dateStr &&
              b.start_time === slotStartTime
          );

          if (!isBooked) {
            slots.push({
              date: dateStr,
              start_time: slotStartTime,
              end_time: slotEndTime,
            });
          }

          currentSlotStart += slot_duration;
        }
      }

      currentDate = addDays(currentDate, 1);
    }

    res.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des créneaux disponibles', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};
