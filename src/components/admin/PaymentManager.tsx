'use client';

/**
 * PaymentManager Component
 * Gestion complète des paiements avec support API
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  createManualTransaction, 
  updateTransactionStatus, 
  deleteTransaction,
  createStripePaymentLink 
} from '@/actions/payments';
import { Trash2, Plus, CreditCard, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  providerTxId: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface Stats {
  totalAmount: number;
  pending: number;
  completed: number;
  failed: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface PaymentManagerProps {
  transactions: Transaction[];
  stats: Stats;
  users: User[];
}

export function PaymentManager({ transactions: initialTransactions, stats, users }: PaymentManagerProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'MANUAL' | 'STRIPE'>('MANUAL');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!selectedUser || !amount) {
      toast.error('Remplissez tous les champs');
      return;
    }

    setIsLoading(true);
    
    let result;
    if (paymentMethod === 'STRIPE') {
      result = await createStripePaymentLink(selectedUser, parseFloat(amount), description);
    } else {
      result = await createManualTransaction(selectedUser, parseFloat(amount), 'CHF', 'MANUAL', { description });
    }
    
    setIsLoading(false);

    if (result.success) {
      toast.success('Transaction créée');
      // Refresh would be handled by revalidatePath
      window.location.reload();
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setIsLoading(true);
    const result = await updateTransactionStatus(id, status as any);
    setIsLoading(false);

    if (result.success) {
      toast.success('Statut mis à jour');
      setTransactions(transactions.map(t => 
        t.id === id ? { ...t, status } : t
      ));
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette transaction ?')) return;

    setIsLoading(true);
    const result = await deleteTransaction(id);
    setIsLoading(false);

    if (result.success) {
      toast.success('Transaction supprimée');
      setTransactions(transactions.filter(t => t.id !== id));
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    COMPLETED: { label: 'Complété', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    FAILED: { label: 'Échoué', color: 'bg-red-100 text-red-800', icon: XCircle },
    REFUNDED: { label: 'Remboursé', color: 'bg-gray-100 text-gray-800', icon: DollarSign },
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalAmount.toFixed(2)} CHF</div>
            <p className="text-sm text-gray-500">Total des transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-gray-500">En attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-sm text-gray-500">Complétées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-sm text-gray-500">Échouées</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAddForm(!showAddForm)} data-testid="add-payment-button">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle transaction
        </Button>
      </div>

      {/* Formulaire */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Utilisateur</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  data-testid="payment-user-select"
                >
                  <option value="">Sélectionner...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Montant (CHF)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10.00"
                  data-testid="payment-amount-input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Accès session..."
                data-testid="payment-description-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Méthode</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={paymentMethod === 'MANUAL'}
                    onChange={() => setPaymentMethod('MANUAL')}
                  />
                  Lien manuel
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={paymentMethod === 'STRIPE'}
                    onChange={() => setPaymentMethod('STRIPE')}
                  />
                  Stripe API
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={isLoading} data-testid="confirm-payment">
                {isLoading ? 'Création...' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Transactions ({transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune transaction</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Utilisateur</th>
                    <th className="text-left p-3 font-medium">Montant</th>
                    <th className="text-left p-3 font-medium">Provider</th>
                    <th className="text-left p-3 font-medium">Statut</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const status = statusConfig[tx.status] || statusConfig.PENDING;
                    const StatusIcon = status.icon;
                    return (
                      <tr key={tx.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3">
                          <p className="font-medium">{tx.user.name}</p>
                          <p className="text-sm text-gray-500">{tx.user.email}</p>
                        </td>
                        <td className="p-3 font-mono">
                          {(tx.amount / 100).toFixed(2)} {tx.currency}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{tx.provider}</Badge>
                        </td>
                        <td className="p-3">
                          <select
                            value={tx.status}
                            onChange={(e) => handleStatusUpdate(tx.id, e.target.value)}
                            className={`p-1 rounded text-sm ${status.color}`}
                            data-testid={`status-${tx.id}`}
                          >
                            <option value="PENDING">En attente</option>
                            <option value="COMPLETED">Complété</option>
                            <option value="FAILED">Échoué</option>
                            <option value="REFUNDED">Remboursé</option>
                          </select>
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tx.id)}
                            className="text-red-600"
                            data-testid={`delete-tx-${tx.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note API */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200">Configuration API</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Pour activer les paiements Stripe automatiques, configurez <code className="bg-blue-100 px-1 rounded">STRIPE_SECRET_KEY</code> dans les variables d'environnement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
