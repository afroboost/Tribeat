/**
 * Middleware Next.js - Protection des Routes
 * 
 * Utilise notre système d'auth personnalisé (cookie tribeat-auth)
 * au lieu de NextAuth pour éviter les problèmes de proxy
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'tribeat-secret-key'
);

async function getTokenPayload(request: NextRequest) {
  try {
    const token = request.cookies.get('tribeat-auth')?.value;
    if (!token) return null;
    
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get user from JWT cookie
  const user = await getTokenPayload(request);

  // ========================================
  // PROTECTION /admin - SUPER_ADMIN UNIQUEMENT
  // ========================================
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }

    return NextResponse.next();
  }

  // ========================================
  // PROTECTION /coach - COACH + SUPER_ADMIN
  // ========================================
  if (pathname.startsWith('/coach')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role !== 'COACH' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }

    return NextResponse.next();
  }

  // ========================================
  // PROTECTION /session/[id] - AUTHENTIFIÉ
  // ========================================
  if (pathname.startsWith('/session/')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ========================================
  // REDIRECTION SI DÉJÀ AUTHENTIFIÉ SUR /auth/*
  // ========================================
  if (pathname.startsWith('/auth/') && user) {
    const redirects: Record<string, string> = {
      SUPER_ADMIN: '/admin/dashboard',
      COACH: '/coach/dashboard',
      PARTICIPANT: '/sessions',
    };

    const redirectUrl = redirects[user.role as string] || '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|nextauth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
