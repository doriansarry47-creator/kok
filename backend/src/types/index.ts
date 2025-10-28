import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'patient';
  };
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'patient';
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
}

export interface Availability {
  id: string;
  day_of_week: number; // 0-6 (dimanche-samedi)
  start_time: string; // Format HH:mm
  end_time: string; // Format HH:mm
  slot_duration: number; // en minutes
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Exception {
  id: string;
  date: Date;
  start_time?: string;
  end_time?: string;
  is_available: boolean; // false = congé, true = ouverture exceptionnelle
  reason?: string;
  created_at: Date;
}

export interface Booking {
  id: string;
  patient_id: string;
  date: Date;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  created_at: Date;
  updated_at: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
}

export interface BookingWithUser extends Booking {
  patient_email: string;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_phone?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  created_at: Date;
}

export interface EmailTemplate {
  type: 'booking_confirmation' | 'booking_reminder' | 'booking_cancellation' | 'booking_modified';
  subject: string;
  body: string;
}
