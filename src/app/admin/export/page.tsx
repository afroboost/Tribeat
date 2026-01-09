/**
 * Page Admin - Export de Données
 * FALLBACK ANTI PAGE BLANCHE
 */

import { ExportPanel } from '@/components/admin/ExportPanel';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function AdminExportPage() {
  return (
    <div className="space-y-6">
      {/* FALLBACK VISIBLE */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
        <h1 className="text-xl font-bold text-green-800">✅ Admin Export — Page chargée</h1>
        <p className="text-green-700">Si tu vois ce texte, le rendu fonctionne correctement.</p>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900">📥 Export de Données</h2>
        <p className="mt-2 text-gray-600">Exportez vos données au format CSV ou JSON.</p>
      </div>

      <ExportPanel />
    </div>
  );
}
