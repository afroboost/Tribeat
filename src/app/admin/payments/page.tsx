/**
 * Admin - Gestion des Paiements
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
  }

  return (
    <div className="space-y-6">
      <h1 style={{ color: 'red', fontSize: '24px', fontWeight: 'bold' }}>RENDER OK — PAYMENTS</h1>
      
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
