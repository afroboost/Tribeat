/**
 * Page Admin - Éditeur de Thème
 * FALLBACK ANTI PAGE BLANCHE
 */

import { ThemeEditor } from '@/components/admin/ThemeEditor';
import { getUISettingsByCategory } from '@/actions/ui-settings';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function AdminThemePage() {
  let themeSettings: any[] = [];
  let pwaSettings: any[] = [];
  let dbError = false;

  try {
    const [themeResult, pwaResult] = await Promise.all([
      getUISettingsByCategory('THEME'),
      getUISettingsByCategory('PWA'),
    ]);
    themeSettings = themeResult.success ? (themeResult.data || []) : [];
    pwaSettings = pwaResult.success ? (pwaResult.data || []) : [];
  } catch (e) {
    console.error('DB Error:', e);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      {/* FALLBACK VISIBLE */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
        <h1 className="text-xl font-bold text-green-800">✅ Admin Thème — Page chargée</h1>
        <p className="text-green-700">Si tu vois ce texte, le rendu fonctionne correctement.</p>
      </div>

      {dbError && (
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800">⚠️ Erreur DB - les paramètres peuvent être incomplets.</p>
        </div>
      )}
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900">🎨 Éditeur de Thème</h2>
        <p className="mt-2 text-gray-600">Personnalisez les couleurs et paramètres PWA.</p>
      </div>

      <ThemeEditor
        initialThemeSettings={themeSettings}
        initialPwaSettings={pwaSettings}
      />
    </div>
  );
}
