/**
 * Admin Layout - Ghost Access
 * FALLBACK ANTI PAGE BLANCHE
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

// FORCE DYNAMIC - NO CACHE
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let session = null;
  
  try {
    session = await getServerSession(authOptions);
    console.log('ADMIN SESSION:', session?.user?.email, session?.user?.role);
  } catch (e) {
    console.error('SESSION ERROR:', e);
  }

  // Pas de session → message visible + lien login
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès Admin</h1>
          <p className="text-gray-600 mb-6">Session admin non détectée. Veuillez vous connecter.</p>
          <a 
            href="/auth/login?callbackUrl=/admin/dashboard" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  // Session mais pas SUPER_ADMIN → message visible
  if (session.user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h1>
          <p className="text-gray-600 mb-4">
            Connecté en tant que : <strong>{session.user?.email}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Rôle actuel : <strong>{session.user?.role}</strong> (SUPER_ADMIN requis)
          </p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  // Accès autorisé
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={session.user} />
        <main className="p-6" style={{ minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
