import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import logger from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-super-securise';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: 'admin' | 'patient';
      };

      req.user = decoded;
      next();
    } catch (error) {
      logger.warn('Token JWT invalide', { error });
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré',
      });
    }
  } catch (error) {
    logger.error('Erreur d\'authentification', { error });
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

export const requireRole = (...roles: ('admin' | 'patient')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
      });
    }

    next();
  };
};

export const generateToken = (user: { id: string; email: string; role: 'admin' | 'patient' }) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
