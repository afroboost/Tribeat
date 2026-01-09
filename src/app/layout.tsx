import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering to always get fresh theme
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tribeat - Sessions Live Interactives',
  description: 'Plateforme de sessions live synchronisées',
};

async function getThemeSettings() {
  try {
    const settings = await prisma.uI_Settings.findMany({
      where: { category: 'THEME' },
    });
    return settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
  } catch {
    return {};
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getThemeSettings();

  // Générer les CSS variables dynamiques
  const cssVars = {
    '--theme-primary': theme.primary_color || '#3b82f6',
    '--theme-secondary': theme.secondary_color || '#8b5cf6',
    '--theme-background': theme.background_color || '#ffffff',
    '--theme-foreground': theme.foreground_color || '#0f0f10',
    '--theme-radius': `${theme.border_radius || '8'}px`,
  };

  const styleString = Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');

  return (
    <html lang="fr" suppressHydrationWarning style={{ ...cssVars } as React.CSSProperties}>
      <body className={inter.className} style={{ backgroundColor: 'var(--theme-background)', color: 'var(--theme-foreground)' }}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
