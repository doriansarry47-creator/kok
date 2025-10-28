'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(userData);

    // Vérifier que c'est un admin
    if (parsedUser.role !== 'admin') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  // Si on est sur la page de login, afficher directement
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b7c59]"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas connecté, ne rien afficher (redirection en cours)
  if (!user) {
    return null;
  }

  const navigation = [
    { name: 'Tableau de bord', href: '/admin/dashboard', icon: '📊' },
    { name: 'Rendez-vous', href: '/admin/rendez-vous', icon: '📅' },
    { name: 'Disponibilités', href: '/admin/disponibilites', icon: '🕐' },
    { name: 'Patients', href: '/admin/patients', icon: '👤' },
    { name: 'Paramètres', href: '/admin/parametres', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 bg-[#6b7c59] text-white">
            <h1 className="text-2xl font-bold">KOK Admin</h1>
            <p className="text-sm text-gray-200 mt-1">Panneau d'administration</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-[#6b7c59] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info et logout */}
          <div className="px-6 py-4 border-t">
            <div className="flex items-center mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <div className="px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
