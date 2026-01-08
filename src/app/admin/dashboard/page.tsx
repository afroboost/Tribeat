/**
 * Dashboard Admin - DEBUG MODE
 */

export default function AdminDashboardPage() {
  console.log('========== DASHBOARD PAGE RENDERED ==========');
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-green-600">
        DASHBOARD PAGE OK - DEBUG MODE
      </h2>
      <p className="text-gray-700">
        Si vous voyez ce texte, le layout et la page fonctionnent.
      </p>
    </div>
  );
}
      {/* Welcome Card */}
      <Card>
          <CardHeader>
            <CardTitle>Vue d'Ensemble</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Bienvenue dans le dashboard admin Tribeat. Gérez le thème, les traductions, les sessions et les utilisateurs depuis cette interface.
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👥 Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{userCount}</p>
              <p className="text-sm text-gray-500">Total d'utilisateurs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎥 Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{sessionCount}</p>
              <p className="text-sm text-gray-500">Sessions créées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚙️ Paramètres</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{settingsCount}</p>
              <p className="text-sm text-gray-500">UI Settings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🌍 Traductions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{translationsCount}</p>
              <p className="text-sm text-gray-500">Clés traduites</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="/admin/theme"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h3 className="font-semibold mb-1">🎨 Modifier le Thème</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Personnalisez couleurs, fonts et radius
                </p>
              </a>
              <a
                href="/admin/translations"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h3 className="font-semibold mb-1">🌍 Gérer Traductions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Modifier FR/EN/DE en temps réel
                </p>
              </a>
              <a
                href="/admin/sessions"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h3 className="font-semibold mb-1">🎥 Créer Session</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nouvelle session live
                </p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
