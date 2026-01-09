'use client';

/**
 * Custom Auth Provider
 * Provider de session personnalisé qui n'utilise PAS NextAuth client
 * pour éviter les problèmes de proxy /api/*
 */

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { getSessionAction } from '@/actions/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: 'loading',
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const refresh = async () => {
    try {
      const result = await getSessionAction();
      if (result) {
        setSession(result);
        setStatus('authenticated');
      } else {
        setSession(null);
        setStatus('unauthenticated');
      }
    } catch {
      setSession(null);
      setStatus('unauthenticated');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ session, status, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  return useContext(AuthContext);
}

export function useAuth() {
  const { session, status, refresh } = useSession();
  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    refresh,
  };
}
