/**
 * Admin - Gestion des Paiements
 * FALLBACK ANTI PAGE BLANCHE
 */

import { getTransactions, getPaymentStats } from '@/actions/payments';
import { prisma } from '@/lib/prisma';
import { PaymentManager } from '@/components/admin/PaymentManager';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  let transactions: any[] = [];
  let stats = { totalAmount: 0, pending: 0, completed: 0, failed: 0 };
  let users: any[] = [];
  let dbError = false;

  try {
    const [transactionsResult, statsResult, usersData] = await Promise.all([
      getTransactions(),
      getPaymentStats(),
      prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      }),
    ]);
    transactions = transactionsResult.success ? (transactionsResult.data as any[]) : [];
    stats = statsResult.success ? (statsResult.data as any) : stats;
    users = usersData;
  } catch (e) {
    console.error('DB Error:', e);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      {/* FALLBACK VISIBLE */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
        <h1 className="text-xl font-bold text-green-800">✅ Admin Paiements — Page chargée</h1>
        <p className="text-green-700">Si tu vois ce texte, le rendu fonctionne correctement.</p>
      </div>

      {dbError && (
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800">⚠️ Erreur DB - les transactions peuvent être incomplètes.</p>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h2>
        <p className="text-gray-500">Transactions et intégrations API</p>
      </div>

      <PaymentManager 
        transactions={transactions} 
        stats={stats}
        users={users} 
      />
    </div>
  );
}
