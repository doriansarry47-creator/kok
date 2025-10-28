import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  register: async (data: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: { first_name?: string; last_name?: string; phone?: string }) => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/auth/me');
    return response.data;
  },

  exportData: async () => {
    const response = await api.get('/auth/me/export');
    return response.data;
  },
};

// Services de disponibilités
export const availabilityService = {
  getAvailabilities: async () => {
    const response = await api.get('/availability');
    return response.data;
  },

  getAvailableSlots: async (startDate: string, endDate: string) => {
    const response = await api.get('/availability/slots', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  createAvailability: async (data: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration: number;
  }) => {
    const response = await api.post('/availability', data);
    return response.data;
  },

  updateAvailability: async (
    id: string,
    data: {
      day_of_week?: number;
      start_time?: string;
      end_time?: string;
      slot_duration?: number;
      is_active?: boolean;
    }
  ) => {
    const response = await api.put(`/availability/${id}`, data);
    return response.data;
  },

  deleteAvailability: async (id: string) => {
    const response = await api.delete(`/availability/${id}`);
    return response.data;
  },

  getExceptions: async () => {
    const response = await api.get('/availability/exceptions');
    return response.data;
  },

  createException: async (data: {
    date: string;
    start_time?: string;
    end_time?: string;
    is_available: boolean;
    reason?: string;
  }) => {
    const response = await api.post('/availability/exceptions', data);
    return response.data;
  },

  deleteException: async (id: string) => {
    const response = await api.delete(`/availability/exceptions/${id}`);
    return response.data;
  },
};

// Services de réservations
export const bookingService = {
  createBooking: async (data: {
    date: string;
    start_time: string;
    end_time: string;
    reason?: string;
  }) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  getBooking: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  updateBooking: async (
    id: string,
    data: {
      date?: string;
      start_time?: string;
      end_time?: string;
      reason?: string;
    }
  ) => {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  },

  cancelBooking: async (id: string, cancellation_reason?: string) => {
    const response = await api.post(`/bookings/${id}/cancel`, { cancellation_reason });
    return response.data;
  },

  // Admin uniquement
  getAllBookings: async (params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  createBookingForPatient: async (data: {
    patient_id: string;
    date: string;
    start_time: string;
    end_time: string;
    reason?: string;
  }) => {
    const response = await api.post('/bookings/admin/create', data);
    return response.data;
  },
};
