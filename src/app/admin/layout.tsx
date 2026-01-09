/**
 * Admin Layout Next.js
 * Layout automatique pour toutes les pages /admin/*
 * 
 * CORRECTION : Utilisation correcte de getServerSession au lieu de getAuthSession
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  console.log('========== ADMIN LAYOUT START ==========');
  
  // Récupération session avec getServerSession (recommandé pour layouts)
  const session = await getServerSession(authOptions);
  
  console.log('Session:', !!session);
  console.log('User:', session?.user?.email);
  console.log('Role:', session?.user?.role);

  // Vérification authentification
  if (!session) {
    console.log('❌ NO SESSION - Redirect to login');
    redirect('/auth/login?callbackUrl=/admin/dashboard');
  }

  // Vérification rôle SUPER_ADMIN
  if (session.user.role !== 'SUPER_ADMIN') {
    console.log('❌ NOT SUPER_ADMIN - Redirect to 403');
    redirect('/403');
  }

  console.log('✅ SUPER_ADMIN AUTHORIZED');
  console.log('=======================================');

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
