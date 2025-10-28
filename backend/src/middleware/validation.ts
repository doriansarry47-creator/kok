import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

// Schémas de validation
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'Email requis',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Mot de passe requis',
  }),
  first_name: Joi.string().min(2).max(50).optional(),
  last_name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string()
    .pattern(/^(\+33|0)[1-9](\d{2}){4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Numéro de téléphone français invalide',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).optional(),
  last_name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string()
    .pattern(/^(\+33|0)[1-9](\d{2}){4}$/)
    .optional()
    .allow('', null),
});

export const availabilitySchema = Joi.object({
  day_of_week: Joi.number().min(0).max(6).required(),
  start_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Format horaire invalide (HH:mm)',
    }),
  end_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  slot_duration: Joi.number().min(15).max(180).required(),
});

export const exceptionSchema = Joi.object({
  date: Joi.date().iso().required(),
  start_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  end_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  is_available: Joi.boolean().required(),
  reason: Joi.string().max(255).optional(),
});

export const bookingSchema = Joi.object({
  date: Joi.date().iso().required(),
  start_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  end_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  reason: Joi.string().max(500).optional().allow(''),
});

export const updateBookingSchema = Joi.object({
  date: Joi.date().iso().optional(),
  start_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  end_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  reason: Joi.string().max(500).optional().allow(''),
  status: Joi.string().valid('confirmed', 'cancelled').optional(),
  cancellation_reason: Joi.string().max(500).optional(),
});
