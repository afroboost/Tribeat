/**
 * Page Admin - Gestion des Utilisateurs
 * FALLBACK ANTI PAGE BLANCHE
 */

import { UserList } from '@/components/admin/UserList';
import { getAllUsers } from '@/actions/users';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  let users: any[] = [];
  let dbError = false;
  
  try {
    const result = await getAllUsers();
    users = result.success ? (result.data || []) : [];
  } catch (e) {
    console.error('DB Error:', e);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      {/* FALLBACK VISIBLE */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
        <h1 className="text-xl font-bold text-green-800">✅ Admin Utilisateurs — Page chargée</h1>
        <p className="text-green-700">Si tu vois ce texte, le rendu fonctionne correctement.</p>
      </div>

      {dbError && (
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800">⚠️ Erreur DB - les utilisateurs peuvent être incomplets.</p>
        </div>
      )}
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900">👥 Gestion des Utilisateurs</h2>
        <p className="mt-2 text-gray-600">Modifiez les rôles et gérez les comptes.</p>
      </div>

      <UserList initialUsers={users} />
    </div>
  );
}
