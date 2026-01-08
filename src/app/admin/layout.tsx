/**
 * Admin Layout Next.js
 * Layout automatique pour toutes les pages /admin/*
 */

import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    console.log('========== ADMIN LAYOUT START ==========');
    
    // Double sécurité : vérification serveur
    const session = await getAuthSession();

    console.log('Session retrieved:', !!session);
    console.log('Session user:', session?.user);
    console.log('User role:', session?.user?.role);
    console.log('Is SUPER_ADMIN?', session?.user?.role === 'SUPER_ADMIN');

    if (!session) {
      console.log('❌ NO SESSION - Redirecting to /403');
      redirect('/403');
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      console.log('❌ NOT SUPER_ADMIN - Redirecting to /403');
      console.log('Actual role:', session.user.role);
      redirect('/403');
    }

    console.log('✅ SUPER_ADMIN AUTHORIZED - Rendering layout');
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
  } catch (error) {
    console.error('========== ADMIN LAYOUT ERROR ==========');
    console.error('Error:', error);
    console.error('========================================');
    throw error;
  }
}
