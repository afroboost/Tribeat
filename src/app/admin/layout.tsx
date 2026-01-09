/**
 * Admin Layout Next.js
 * Protection par getServerSession NextAuth
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  // Vérification authentification
  if (!session) {
    redirect('/auth/login?callbackUrl=/admin/dashboard');
  }

  // Vérification rôle SUPER_ADMIN
  if (session.user?.role !== 'SUPER_ADMIN') {
    redirect('/403');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={session.user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
