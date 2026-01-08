/**
 * Theme Provider - Injection Dynamique UI_Settings
 * 
 * Architecture Production :
 * - Lit UI_Settings depuis DB
 * - Injecte CSS Variables dans <html>
 * - Hook useTheme() pour accès contexte
 * - Zéro hardcoding : tout vient de la DB
 * 
 * IMPORTANT :
 * Ce provider permet au Super Admin de modifier le thème
 * en temps réel sans redéploiement
 */

'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';

// ========================================
// TYPES
// ========================================

interface ThemeSettings {
  // Theme colors
  primary_color: string;
  secondary_color: string;
  background_color: string;
  foreground_color: string;
  border_radius: string;
  font_family: string;
  
  // PWA
  pwa_app_name: string;
  pwa_theme_color: string;
  
  // General
  site_title: string;
  default_language: string;
}

interface ThemeContextValue {
  settings: ThemeSettings | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

// ========================================
// CONTEXT
// ========================================

const ThemeContext = createContext<ThemeContextValue>({
  settings: null,
  isLoading: true,
  refresh: async () => {},
});

// ========================================
// PROVIDER
// ========================================

interface ThemeProviderProps {
  children: ReactNode;
  initialSettings?: ThemeSettings;
}

export function ThemeProvider({ children, initialSettings }: ThemeProviderProps) {
  const [settings, setSettings] = useState<ThemeSettings | null>(initialSettings || null);
  const [isLoading, setIsLoading] = useState(!initialSettings);

  // Fonction pour récupérer les settings depuis l'API
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/theme/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        applyThemeToDOM(data);
      }
    } catch (error) {
      console.error('Error fetching theme settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Appliquer le thème au DOM (CSS Variables)
  const applyThemeToDOM = (themeSettings: ThemeSettings) => {
    if (!themeSettings) return;

    const root = document.documentElement;

    // Convertir hex en HSL pour CSS Variables (compatibilité Tailwind)
    const hexToHSL = (hex: string) => {
      // Conversion simplifiée (production: utiliser une lib)
      return hex; // Pour l'instant, on garde hex
    };

    // Appliquer les CSS Variables
    root.style.setProperty('--primary', hexToHSL(themeSettings.primary_color));
    root.style.setProperty('--secondary', hexToHSL(themeSettings.secondary_color));
    root.style.setProperty('--background', hexToHSL(themeSettings.background_color));
    root.style.setProperty('--foreground', hexToHSL(themeSettings.foreground_color));
    root.style.setProperty('--radius', themeSettings.border_radius + 'px');
    
    // Font family
    if (themeSettings.font_family) {
      root.style.setProperty('font-family', themeSettings.font_family);
    }
  };

  // Charger les settings au montage
  useEffect(() => {
    if (!initialSettings) {
      fetchSettings();
    } else {
      applyThemeToDOM(initialSettings);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, isLoading, refresh: fetchSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ========================================
// HOOK
// ========================================

/**
 * Hook pour accéder au thème dans les composants
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
