'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardStats {
  totalPatients: number;
  upcomingBookings: number;
  todayBookings: any[];
  recentCancellations: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b7c59]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de votre cabinet</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Patients total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalPatients || 0}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">RDV à venir (7j)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.upcomingBookings || 0}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">RDV aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.todayBookings?.length || 0}</p>
            </div>
            <div className="text-4xl">📆</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Annulations (7j)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.recentCancellations || 0}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* Today's Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Rendez-vous d'aujourd'hui</h2>
        </div>
        <div className="p-6">
          {stats?.todayBookings && stats.todayBookings.length > 0 ? (
            <div className="space-y-4">
              {stats.todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-[#6b7c59] rounded-lg flex items-center justify-center text-white text-xl">
                      👤
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.patient_first_name || ''} {booking.patient_last_name || ''}
                      </p>
                      <p className="text-sm text-gray-600">{booking.patient_email}</p>
                      {booking.patient_phone && (
                        <p className="text-sm text-gray-500">📞 {booking.patient_phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-[#6b7c59]">
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status === 'confirmed'
                        ? 'Confirmé'
                        : booking.status === 'pending'
                        ? 'En attente'
                        : booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500">Aucun rendez-vous aujourd'hui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
