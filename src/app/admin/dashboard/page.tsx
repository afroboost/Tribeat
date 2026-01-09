/**
 * Dashboard Admin - FALLBACK ANTI PAGE BLANCHE
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let userCount = 0, sessionCount = 0, settingsCount = 0, translationsCount = 0;
  let dbError = false;
  
  try {
    [userCount, sessionCount, settingsCount, translationsCount] = await Promise.all([
      prisma.user.count(),
      prisma.session.count(),
      prisma.uI_Settings.count(),
      prisma.translation.count(),
    ]);
  } catch (e) {
    console.error('DB Error:', e);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      {/* FALLBACK VISIBLE - TOUJOURS AFFICHÉ */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
        <h1 className="text-xl font-bold text-green-800">✅ Admin Dashboard — Page chargée</h1>
        <p className="text-green-700">Si tu vois ce texte, le rendu fonctionne correctement.</p>
      </div>

      {dbError && (
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800">⚠️ Erreur de connexion à la base de données. Les stats peuvent être incorrectes.</p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Vue d'Ensemble</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Bienvenue dans le dashboard admin Tribeat.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">👥 Utilisateurs</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">🎥 Sessions</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{sessionCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">⚙️ Paramètres</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{settingsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">🌍 Traductions</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{translationsCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="/admin/theme" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold mb-1">🎨 Modifier le Thème</h3>
              <p className="text-sm text-gray-600">Personnalisez couleurs et fonts</p>
            </a>
            <a href="/admin/translations" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold mb-1">🌍 Gérer Traductions</h3>
              <p className="text-sm text-gray-600">Modifier FR/EN/DE</p>
            </a>
            <a href="/admin/sessions" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold mb-1">🎥 Créer Session</h3>
              <p className="text-sm text-gray-600">Nouvelle session live</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
