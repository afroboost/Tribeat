/**
 * Admin Header
 * 
 * Header avec info utilisateur et logout
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { toast } from 'sonner';

interface AdminHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const result = await logoutAction();
    if (result.success) {
      toast.success('Déconnexion réussie');
      router.push('/');
      router.refresh();
    } else {
      toast.error('Erreur lors de la déconnexion');
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Title (mobile) */}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:hidden">
          Admin
        </h1>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-testid="admin-logout-button"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
}
