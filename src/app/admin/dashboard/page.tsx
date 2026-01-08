/**
 * Dashboard Admin - SUPER_ADMIN UNIQUEMENT
 * Route protégée par middleware
 */

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboardPage() {
  // Récupérer les stats depuis la DB
  const [userCount, sessionCount, settingsCount, translationsCount] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.uI_Settings.count(),
    prisma.translation.count(),
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Bienvenue, {session.user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Vous êtes connecté en tant que <strong>Super Admin</strong>.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Phase 4 : Dashboard Admin complet sera implémenté prochainement.
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">👥 Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">3</p>
                <p className="text-sm text-gray-500">Total d'utilisateurs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎥 Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">1</p>
                <p className="text-sm text-gray-500">Sessions actives</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚙️ Paramètres</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">16</p>
                <p className="text-sm text-gray-500">UI Settings</p>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon */}
          <Card>
            <CardHeader>
              <CardTitle>🚧 En Développement - Phase 4</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                Les fonctionnalités suivantes seront disponibles prochainement :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-500 dark:text-gray-500">
                <li>Éditeur de thème (couleurs, fonts, radius)</li>
                <li>Gestion des traductions (FR/EN/DE)</li>
                <li>CRUD Sessions complètes</li>
                <li>Gestion des utilisateurs et rôles</li>
                <li>Export données (CSV/JSON)</li>
                <li>Statistiques avancées</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
