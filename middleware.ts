/**
 * Middleware Next.js - Protection des Routes
 * 
 * IMPORTANT: La protection /admin est gérée par le layout admin
 * pour éviter les conflits de redirection
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for admin routes - handled by layout
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

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

  // Protection /sessions - Authentifié
  if (pathname === '/sessions') {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirection si déjà authentifié sur /auth/*
  if (pathname.startsWith('/auth/') && token) {
    // SUPER_ADMIN reste sur la page auth (accès manuel à /admin)
    if (token.role === 'SUPER_ADMIN') {
      return NextResponse.next();
    }
    
    const redirects: Record<string, string> = {
      COACH: '/coach/dashboard',
      PARTICIPANT: '/sessions',
    };
    const redirectUrl = redirects[token.role as string] || '/sessions';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
