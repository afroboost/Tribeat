/**
 * Admin - Gestion des Accès
 * FALLBACK ANTI PAGE BLANCHE
 */

import { getAccesses } from '@/actions/access';
import { prisma } from '@/lib/prisma';
import { AccessManager } from '@/components/admin/AccessManager';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function AccessPage() {
  let accesses: any[] = [];
  let sessions: any[] = [];
  let users: any[] = [];
  let dbError = false;

  try {
    const [accessesResult, sessionsData, usersData] = await Promise.all([
      getAccesses(),
      prisma.session.findMany({
        select: { id: true, title: true, status: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: 'asc' },
      }),
    ]);
    accesses = accessesResult.success ? (accessesResult.data as any[]) : [];
    sessions = sessionsData;
    users = usersData;
  } catch (e) {
    console.error('DB Error:', e);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      {/* FALLBACK VISIBLE */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
        <h1 className="text-xl font-bold text-green-800">✅ Admin Accès — Page chargée</h1>
        <p className="text-green-700">Si tu vois ce texte, le rendu fonctionne correctement.</p>
      </div>

      {dbError && (
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800">⚠️ Erreur DB - les données peuvent être incomplètes.</p>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Accès</h2>
        <p className="text-gray-500">Gérez les accès des utilisateurs aux sessions</p>
      </div>

      <AccessManager 
        accesses={accesses} 
        sessions={sessions} 
        users={users} 
      />
    </div>
  );
}
