import React from 'react';
import { supabase } from './supabase';

interface ThemeSettings {
  site_primary_color_from: string;
  site_primary_color_to: string;
  site_use_primary_gradient: boolean;
  site_secondary_color_from: string;
  site_secondary_color_to: string;
  site_use_secondary_gradient: boolean;
  site_text_color_dark: string;
  site_text_color_light: string;
  site_background_color_light: string;
  site_background_color_dark: string;
  site_accent_color_1: string;
  site_accent_color_2: string;
  site_button_text_color: string;
  site_header_text_color: string;
  site_header_font_family: string;
  site_hero_title: string;
  site_hero_description: string;
}

// Cache das configurações de tema
let themeCache: ThemeSettings | null = null;
let themeCacheTime = 0;
const THEME_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Configurações padrão
const defaultTheme: ThemeSettings = {
  site_primary_color_from: '#19274e',
  site_primary_color_to: '#2a3b63',
  site_use_primary_gradient: true,
  site_secondary_color_from: '#1a3a70',
  site_secondary_color_to: '#2d5299',
  site_use_secondary_gradient: true,
  site_text_color_dark: '#374151',
  site_text_color_light: '#FFFFFF',
  site_background_color_light: '#F9FAFB',
  site_background_color_dark: '#19274e',
  site_accent_color_1: '#60a5fa',
  site_accent_color_2: '#93c5fd',
  site_button_text_color: '#FFFFFF',
  site_header_text_color: '#FFFFFF',
  site_header_font_family: 'Inter',
  site_hero_title: 'Tradição e Fé',
  site_hero_description: 'Uma catedral histórica no coração de São Miguel Paulista, sendo referência de fé e tradição para toda a região. Um lugar sagrado onde gerações encontram paz e esperança.',
};

// Buscar configurações de tema
export const getThemeSettings = async (): Promise<ThemeSettings> => {
  // Verificar cache
  if (themeCache && Date.now() - themeCacheTime < THEME_CACHE_DURATION) {
    return themeCache;
  }

  try {
    const settingKeys = Object.keys(defaultTheme) as Array<keyof ThemeSettings>;
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', settingKeys);

    if (error) throw error;

    const fetchedSettings: Partial<ThemeSettings> = {};
    data?.forEach(setting => {
      if (setting.key === 'site_use_primary_gradient' || setting.key === 'site_use_secondary_gradient') {
        fetchedSettings[setting.key as keyof ThemeSettings] = setting.value === 'true';
      } else {
        fetchedSettings[setting.key as keyof ThemeSettings] = setting.value as any;
      }
    });

    themeCache = { ...defaultTheme, ...fetchedSettings };
    themeCacheTime = Date.now();
    return themeCache;
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    return defaultTheme;
  }
};

// Aplicar tema ao documento
export const applyThemeToDocument = (theme: ThemeSettings) => {
  const root = document.documentElement;
  
  // Aplicar todas as variáveis CSS
  root.style.setProperty('--color-primary-from', theme.site_primary_color_from);
  root.style.setProperty('--color-primary-to', theme.site_primary_color_to);
  root.style.setProperty('--use-primary-gradient', theme.site_use_primary_gradient.toString());
  root.style.setProperty('--color-secondary-from', theme.site_secondary_color_from);
  root.style.setProperty('--color-secondary-to', theme.site_secondary_color_to);
  root.style.setProperty('--use-secondary-gradient', theme.site_use_secondary_gradient.toString());
  root.style.setProperty('--color-text-dark', theme.site_text_color_dark);
  root.style.setProperty('--color-text-light', theme.site_text_color_light);
  root.style.setProperty('--color-background-light', theme.site_background_color_light);
  root.style.setProperty('--color-background-dark', theme.site_background_color_dark);
  root.style.setProperty('--color-accent-1', theme.site_accent_color_1);
  root.style.setProperty('--color-accent-2', theme.site_accent_color_2);
  root.style.setProperty('--color-button-text', theme.site_button_text_color);
  root.style.setProperty('--color-header-text', theme.site_header_text_color);
  root.style.setProperty('--site-header-font-family', `'${theme.site_header_font_family}', system-ui, -apple-system, sans-serif`);
  root.style.setProperty('--site-header-font-family', `'${theme.site_header_font_family}', system-ui, -apple-system, sans-serif`);
};

// Invalidar cache do tema
export const invalidateThemeCache = () => {
  themeCache = null;
  themeCacheTime = 0;
};

// Hook personalizado para usar o tema
export const useTheme = () => {
  const [theme, setTheme] = React.useState<ThemeSettings>(defaultTheme);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadTheme = async () => {
      try {
        const themeSettings = await getThemeSettings();
        setTheme(themeSettings);
        applyThemeToDocument(themeSettings);
      } catch (error) {
        console.error('Error loading theme:', error);
        applyThemeToDocument(defaultTheme);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    const updatedTheme = { ...theme, ...newTheme };
    setTheme(updatedTheme);
    applyThemeToDocument(updatedTheme);
    invalidateThemeCache();
  };

  return { theme, isLoading, updateTheme };
};