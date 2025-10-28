import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { query } from '../config/database';
import logger from '../config/logger';

export const auditLog = (action: string, resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (data: any) {
      // Log uniquement si succès
      if (data.success !== false && req.user) {
        const resourceId = req.params.id || data.data?.id || null;

        query(
          `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            req.user.id,
            action,
            resourceType,
            resourceId,
            JSON.stringify({
              method: req.method,
              path: req.path,
              body: req.body,
            }),
            req.ip,
          ]
        ).catch((error) => {
          logger.error('Erreur lors de l\'audit log', { error });
        });
      }

      return originalJson.call(this, data);
    };

    next();
  };
};
