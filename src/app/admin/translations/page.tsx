/**
 * Page Admin - Gestion des Traductions
 * FALLBACK ANTI PAGE BLANCHE
 */

import { TranslationEditor } from '@/components/admin/TranslationEditor';
import { getAllTranslations } from '@/actions/translations';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function AdminTranslationsPage() {
  let translations: any[] = [];
  let dbError = false;

  try {
    const result = await getAllTranslations();
    translations = result.success ? (result.data || []) : [];
  } catch (e) {
    console.error('DB Error:', e);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      {/* FALLBACK VISIBLE */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
        <h1 className="text-xl font-bold text-green-800">✅ Admin Traductions — Page chargée</h1>
        <p className="text-green-700">Si tu vois ce texte, le rendu fonctionne correctement.</p>
      </div>

      {dbError && (
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800">⚠️ Erreur DB - les traductions peuvent être incomplètes.</p>
        </div>
      )}
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900">🌍 Gestion des Traductions</h2>
        <p className="mt-2 text-gray-600">Modifiez les traductions FR/EN/DE.</p>
      </div>

      <TranslationEditor initialTranslations={translations} />
    </div>
  );
}
