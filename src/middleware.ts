/**
 * Middleware - Protection des routes admin
 * Redirige vers login si pas authentifié
 */

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Récupérer le token JWT
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'tribeat-super-secret-key-change-in-prod',
  });

  // Routes admin protégées
  if (path.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }
    
    // Vérifier le rôle SUPER_ADMIN
    if (token.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  // Routes coach protégées
  if (path.startsWith('/coach')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }
    
    if (token.role !== 'COACH' && token.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  // Routes sessions protégées (user connecté)
  if (path.startsWith('/sessions') || path.match(/^\/session\/[^/]+$/)) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/coach/:path*', 
    '/sessions',
    '/session/:path*',
  ],
};
