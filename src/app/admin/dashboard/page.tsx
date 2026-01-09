/**
 * Dashboard Admin
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let userCount = 0, sessionCount = 0, settingsCount = 0, translationsCount = 0;
  
  try {
    [userCount, sessionCount, settingsCount, translationsCount] = await Promise.all([
      prisma.user.count(),
      prisma.session.count(),
      prisma.uI_Settings.count(),
      prisma.translation.count(),
    ]);
  } catch (e) {
    console.error('DB Error:', e);
  }

  return (
    <div className="space-y-6">
      <h1 style={{ color: 'red', fontSize: '24px', fontWeight: 'bold' }}>RENDER OK — DASHBOARD</h1>
      
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
    </div>
  );
}
