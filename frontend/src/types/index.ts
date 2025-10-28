export interface User {
  id: string;
  email: string;
  role: 'admin' | 'patient';
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  last_login?: string;
}

export interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
}

export interface Exception {
  id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  is_available: boolean;
  reason?: string;
}

export interface Booking {
  id: string;
  patient_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  patient_email?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_phone?: string;
}

export interface AvailableSlot {
  date: string;
  start_time: string;
  end_time: string;
}
