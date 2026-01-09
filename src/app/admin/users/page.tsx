/**
 * Page Admin - Gestion des Utilisateurs
 */

import { UserList } from '@/components/admin/UserList';
import { getAllUsers } from '@/actions/users';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  let users: any[] = [];
  
  try {
    const result = await getAllUsers();
    users = result.success ? (result.data || []) : [];
  } catch (e) {
    console.error('DB Error:', e);
  }

  return (
    <div className="space-y-6">
      <h1 style={{ color: 'red', fontSize: '24px', fontWeight: 'bold' }}>RENDER OK — USERS</h1>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900">👥 Gestion des Utilisateurs</h2>
        <p className="mt-2 text-gray-600">Modifiez les rôles et gérez les comptes.</p>
      </div>

      <UserList initialUsers={users} />
    </div>
  );
}
