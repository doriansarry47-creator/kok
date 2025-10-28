'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
}

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function AdminAvailabilityPage() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/availability`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setAvailabilities(response.data.data);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      setLoading(false);
    }
  };

  const toggleAvailability = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/availability/${id}`,
        { is_active: !isActive },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchAvailabilities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const deleteAvailability = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/availability/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchAvailabilities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const groupByDay = () => {
    const grouped: Record<number, Availability[]> = {};
    availabilities.forEach((avail) => {
      if (!grouped[avail.day_of_week]) {
        grouped[avail.day_of_week] = [];
      }
      grouped[avail.day_of_week].push(avail);
    });
    return grouped;
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b7c59]"></div>
      </div>
    );
  }

  const groupedAvailabilities = groupByDay();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des disponibilités</h1>
        <p className="text-gray-600 mt-2">Configurez vos horaires de travail</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
          const dayAvails = groupedAvailabilities[dayNum] || [];
          return (
            <div key={dayNum} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {DAYS[dayNum]}
              </h3>

              {dayAvails.length > 0 ? (
                <div className="space-y-3">
                  {dayAvails.map((avail) => (
                    <div
                      key={avail.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        avail.is_active
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatTime(avail.start_time)} - {formatTime(avail.end_time)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Créneaux de {avail.slot_duration} min
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAvailability(avail.id, avail.is_active)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                            avail.is_active
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-400 text-white hover:bg-gray-500'
                          }`}
                        >
                          {avail.is_active ? 'Actif' : 'Inactif'}
                        </button>
                        <button
                          onClick={() => deleteAvailability(avail.id)}
                          className="px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Aucune disponibilité configurée</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informations</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Les disponibilités définissent vos horaires de travail hebdomadaires</li>
          <li>• Les créneaux inactifs n'apparaissent pas pour la réservation en ligne</li>
          <li>• Vous pouvez ajouter plusieurs plages horaires par jour</li>
        </ul>
      </div>
    </div>
  );
}
