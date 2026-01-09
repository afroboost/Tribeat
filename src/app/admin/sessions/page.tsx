/**
 * Page Admin - Gestion des Sessions
 * FALLBACK ANTI PAGE BLANCHE
 */

import { SessionList } from '@/components/admin/SessionList';
import { getAllSessions } from '@/actions/sessions';
import { getAllUsers } from '@/actions/users';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function AdminSessionsPage() {
  let sessions: any[] = [];
  let coaches: any[] = [];
  let dbError = false;

  try {
    const [sessionsResult, usersResult] = await Promise.all([
      getAllSessions(),
      getAllUsers(),
    ]);
    sessions = sessionsResult.success ? (sessionsResult.data || []) : [];
    coaches = usersResult.success 
      ? (usersResult.data?.filter((u: any) => u.role === 'COACH' || u.role === 'SUPER_ADMIN') || [])
      : [];
  } catch (e) {
    console.error('DB Error:', e);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      {/* FALLBACK VISIBLE */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
        <h1 className="text-xl font-bold text-green-800">✅ Admin Sessions — Page chargée</h1>
        <p className="text-green-700">Si tu vois ce texte, le rendu fonctionne correctement.</p>
      </div>

      {dbError && (
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800">⚠️ Erreur DB - les sessions peuvent être incomplètes.</p>
        </div>
      )}
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900">🎥 Gestion des Sessions</h2>
        <p className="mt-2 text-gray-600">Créez, modifiez et supprimez les sessions live.</p>
      </div>

      <SessionList initialSessions={sessions} coaches={coaches} />
    </div>
  );
}
