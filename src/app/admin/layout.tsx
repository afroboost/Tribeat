/**
 * Admin Layout Next.js
 * Layout automatique pour toutes les pages /admin/*
 * 
 * Utilise notre système d'auth personnalisé
 */

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'tribeat-secret-key'
);

async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tribeat-auth')?.value;
    
    if (!token) return null;
    
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string,
        role: payload.role as string,
      },
    };
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  console.log('========== ADMIN LAYOUT START ==========');
  
  const session = await getSession();
  
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
