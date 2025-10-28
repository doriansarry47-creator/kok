import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import bookingRoutes from './routes/bookingRoutes';
import adminRoutes from './routes/adminRoutes';
import { generalLimiter } from './middleware/rateLimiter';
import logger from './config/logger';
import { pool } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  })
);

// Middleware de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting général
app.use(generalLimiter);

// Logging des requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  });
});

// Gestionnaire d'erreurs global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erreur non gérée', { error: err, path: req.path });
  res.status(500).json({
    success: false,
    message: 'Erreur serveur',
  });
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
  logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion de l'arrêt gracieux
const gracefulShutdown = () => {
  logger.info('🛑 Arrêt du serveur...');
  server.close(() => {
    logger.info('✅ Serveur arrêté');
    pool.end(() => {
      logger.info('✅ Connexion à la base de données fermée');
      process.exit(0);
    });
  });

  // Forcer l'arrêt après 10 secondes
  setTimeout(() => {
    logger.error('❌ Arrêt forcé');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
