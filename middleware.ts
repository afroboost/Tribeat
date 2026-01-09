/**
 * Middleware Next.js - Protection des Routes
 * Utilise NextAuth getToken pour vérifier l'authentification
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Récupérer le token JWT NextAuth
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Protection /admin - SUPER_ADMIN uniquement
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  // Protection /coach - COACH + SUPER_ADMIN
  if (pathname.startsWith('/coach')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== 'COACH' && token.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  // Protection /session/[id] - Authentifié
  if (pathname.startsWith('/session/')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirection si déjà authentifié sur /auth/*
  if (pathname.startsWith('/auth/') && token) {
    const redirects: Record<string, string> = {
      SUPER_ADMIN: '/admin/dashboard',
      COACH: '/coach/dashboard',
      PARTICIPANT: '/sessions',
    };
    const redirectUrl = redirects[token.role as string] || '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
