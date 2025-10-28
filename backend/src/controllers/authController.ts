import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { generateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import logger from '../config/logger';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      });
    }

    // Hasher le mot de passe
    const password_hash = await bcrypt.hash(password, 12);
    const id = uuidv4();

    // Créer l'utilisateur
    await query(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, email, password_hash, 'patient', first_name, last_name, phone, true]
    );

    // Générer le token
    const token = generateToken({ id, email, role: 'patient' });

    logger.info('Nouvel utilisateur enregistré', { userId: id, email });

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        token,
        user: {
          id,
          email,
          role: 'patient',
          first_name,
          last_name,
          phone,
        },
      },
    });
  } catch (error) {
    logger.error('Erreur lors de l\'inscription', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Récupérer l'utilisateur
    const result = await query(
      'SELECT id, email, password_hash, role, first_name, last_name, phone, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé',
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Mettre à jour last_login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Générer le token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    logger.info('Utilisateur connecté', { userId: user.id, email });

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la connexion', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      'SELECT id, email, role, first_name, last_name, phone, created_at, last_login FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { first_name, last_name, phone } = req.body;

    await query(
      'UPDATE users SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW() WHERE id = $4',
      [first_name, last_name, phone, userId]
    );

    logger.info('Profil mis à jour', { userId });

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du profil', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Anonymiser les données au lieu de supprimer (RGPD)
    await query(
      `UPDATE users 
       SET email = CONCAT('deleted_', id, '@deleted.local'),
           first_name = 'Supprimé',
           last_name = 'Supprimé',
           phone = NULL,
           is_active = false,
           updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );

    logger.info('Compte supprimé/anonymisé', { userId });

    res.json({
      success: true,
      message: 'Compte supprimé avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression du compte', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

export const exportData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Récupérer toutes les données de l'utilisateur
    const userData = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const bookingsData = await query('SELECT * FROM bookings WHERE patient_id = $1', [userId]);

    const exportData = {
      user: userData.rows[0],
      bookings: bookingsData.rows,
      exported_at: new Date().toISOString(),
    };

    logger.info('Données exportées', { userId });

    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    logger.error('Erreur lors de l\'export des données', { error });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};
