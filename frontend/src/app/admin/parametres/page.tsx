'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface CabinetSettings {
  id: string;
  cabinet_name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  logo_url?: string;
  notification_enabled: boolean;
  reminder_days_before: number;
  allow_online_booking: boolean;
  slot_duration_default: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<CabinetSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulaire de changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSettings(response.data.data);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      setLoading(false);
    }
  };

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/settings`,
        settings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess('Paramètres mis à jour avec succès');
        setTimeout(() => setSuccess(''), 3000);
      }
      setSaving(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/security/password`,
        {
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPasswordSuccess('Mot de passe modifié avec succès');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b7c59]"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Paramètres non trouvés</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres du cabinet</h1>
        <p className="text-gray-600 mt-2">Configurez les informations de votre cabinet</p>
      </div>

      {/* Paramètres du cabinet */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations générales</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <form onSubmit={updateSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du cabinet
              </label>
              <input
                type="text"
                value={settings.cabinet_name || ''}
                onChange={(e) => setSettings({ ...settings, cabinet_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c59] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de contact
              </label>
              <input
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c59] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone de contact
              </label>
              <input
                type="tel"
                value={settings.contact_phone || ''}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c59] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée par défaut des créneaux (minutes)
              </label>
              <input
                type="number"
                value={settings.slot_duration_default || 60}
                onChange={(e) =>
                  setSettings({ ...settings, slot_duration_default: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c59] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse du cabinet
            </label>
            <textarea
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c59] focus:border-transparent"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notification_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, notification_enabled: e.target.checked })
                }
                className="h-4 w-4 text-[#6b7c59] focus:ring-[#6b7c59] border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="ml-2 text-sm text-gray-700">
                Activer les notifications par email
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="online-booking"
                checked={settings.allow_online_booking}
                onChange={(e) =>
                  setSettings({ ...settings, allow_online_booking: e.target.checked })
                }
                className="h-4 w-4 text-[#6b7c59] focus:ring-[#6b7c59] border-gray-300 rounded"
              />
              <label htmlFor="online-booking" className="ml-2 text-sm text-gray-700">
                Autoriser la prise de rendez-vous en ligne
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#6b7c59] text-white rounded-lg hover:bg-[#5a6b48] transition font-medium disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </form>
      </div>

      {/* Sécurité - Changement de mot de passe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Sécurité</h2>

        {passwordError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{passwordError}</p>
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{passwordSuccess}</p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, current_password: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c59] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c59] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c59] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-[#6b7c59] text-white rounded-lg hover:bg-[#5a6b48] transition font-medium"
          >
            Changer le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}
