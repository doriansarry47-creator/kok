import rateLimit from 'express-rate-limit';

// Limiter général pour toutes les routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter strict pour l'authentification (protection brute-force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
  },
});

// Limiter pour l'inscription
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 inscriptions par IP
  message: {
    success: false,
    message: 'Trop d\'inscriptions, veuillez réessayer plus tard',
  },
});

// Limiter pour les réservations
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 réservations par heure
  message: {
    success: false,
    message: 'Trop de tentatives de réservation, veuillez réessayer plus tard',
  },
});
