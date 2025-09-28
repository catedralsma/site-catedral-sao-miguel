import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Palette, RefreshCw, Eye, RotateCcw, Paintbrush, Type, Square } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

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
}

const defaultSettings: ThemeSettings = {
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
};

// Lista de fontes disponíveis para o usuário
const availableFonts = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Merriweather',
  'Lora',
  'Source Sans Pro',
  'Nunito',
  'Crimson Text',
  'Libre Baskerville',
  'Oswald',
  'Noto Sans',
  'Cinzel',
  'Tangerine',
  'Old Standard TT',
  'EB Garamond',
  'UnifrakturMaguntia',
  'Fira Sans',
  'Raleway',
  'DM Serif Display',
];

// Componente auxiliar para entrada de cor
const ColorInput: React.FC<{
  label: string;
  name: keyof ThemeSettings;
  value: string;
  description?: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}> = ({ label, name, value, description, handleChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        name={name}
        value={value}
        onChange={handleChange}
        className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
      />
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        placeholder="#RRGGBB"
      />
    </div>
    {description && (
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    )}
  </div>
);

export const ThemeCustomizer: React.FC = () => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const settingKeys: Array<keyof ThemeSettings> = [
    'site_primary_color_from',
    'site_primary_color_to',
    'site_use_primary_gradient',
    'site_secondary_color_from',
    'site_secondary_color_to',
    'site_use_secondary_gradient',
    'site_text_color_dark',
    'site_text_color_light',
    'site_background_color_light',
    'site_background_color_dark',
    'site_accent_color_1',
    'site_accent_color_2',
    'site_button_text_color',
    'site_header_text_color',
    'site_header_font_family',
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', settingKeys);

      if (error) throw error;

      const fetchedSettings: Partial<ThemeSettings> = {};
      data?.forEach(setting => {
        if (setting.key === 'site_use_primary_gradient' || setting.key === 'site_use_secondary_gradient') {
          fetchedSettings[setting.key] = setting.value === 'true';
        } else {
          fetchedSettings[setting.key as keyof ThemeSettings] = setting.value;
        }
      });

      setSettings(prev => ({ ...prev, ...fetchedSettings }));
      
      // Aplicar as cores carregadas
      applyThemeToDocument({ ...defaultSettings, ...fetchedSettings });
    } catch (error) {
      console.error('Error fetching theme settings:', error);
      toast.error('Erro ao carregar configurações de tema.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeToDocument = (themeSettings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Aplicar cores primárias
    root.style.setProperty('--color-primary-from', themeSettings.site_primary_color_from);
    root.style.setProperty('--color-primary-to', themeSettings.site_primary_color_to);
    root.style.setProperty('--use-primary-gradient', themeSettings.site_use_primary_gradient.toString());
    
    // Aplicar cores secundárias
    root.style.setProperty('--color-secondary-from', themeSettings.site_secondary_color_from);
    root.style.setProperty('--color-secondary-to', themeSettings.site_secondary_color_to);
    root.style.setProperty('--use-secondary-gradient', themeSettings.site_use_secondary_gradient.toString());
    
    // Aplicar cores de texto
    root.style.setProperty('--color-text-dark', themeSettings.site_text_color_dark);
    root.style.setProperty('--color-text-light', themeSettings.site_text_color_light);
    root.style.setProperty('--color-button-text', themeSettings.site_button_text_color);
    root.style.setProperty('--color-header-text', themeSettings.site_header_text_color);
    
    // Aplicar cores de fundo
    root.style.setProperty('--color-background-light', themeSettings.site_background_color_light);
    root.style.setProperty('--color-background-dark', themeSettings.site_background_color_dark);
    
    // Aplicar cores de destaque
    root.style.setProperty('--color-accent-1', themeSettings.site_accent_color_1);
    root.style.setProperty('--color-accent-2', themeSettings.site_accent_color_2);
    
    // Aplicar a fonte do cabeçalho
    root.style.setProperty('--site-header-font-family', themeSettings.site_header_font_family);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const newSettings = {
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    };
    
    setSettings(newSettings);
    
    // Aplicar mudanças em tempo real
    applyThemeToDocument(newSettings);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => {
        const settingValue = typeof value === 'boolean' ? String(value) : value;
        return {
          key,
          value: settingValue,
          description: `Theme setting: ${key}`,
          is_encrypted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('system_settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;

      toast.success('Tema personalizado salvo com sucesso!');
    } catch (error) {
      console.error('Error saving theme settings:', error);
      toast.error('Erro ao salvar configurações de tema.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as cores padrão?')) {
      setSettings(defaultSettings);
      applyThemeToDocument(defaultSettings);
      toast.success('Cores padrão restauradas!');
    }
  };

  const handlePreview = () => {
    setIsApplying(true);
    applyThemeToDocument(settings);
    setTimeout(() => setIsApplying(false), 1000);
    toast.success('Prévia aplicada! Salve para manter as alterações.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Palette className="h-7 w-7 text-blue-600" />
          Personalizar Cores do Site
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={isApplying}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {isApplying ? 'Aplicando...' : 'Prévia'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Preview das cores atuais */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Prévia das Cores
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border border-gray-200 mb-2"
              style={{
                background: settings.site_use_primary_gradient
                  ? `linear-gradient(to right, ${settings.site_primary_color_from}, ${settings.site_primary_color_to})`
                  : settings.site_primary_color_from
              }}
            ></div>
            <p className="text-xs text-gray-600">Primária</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border border-gray-200 mb-2"
              style={{
                background: settings.site_use_secondary_gradient
                  ? `linear-gradient(to right, ${settings.site_secondary_color_from}, ${settings.site_secondary_color_to})`
                  : settings.site_secondary_color_from
              }}
            ></div>
            <p className="text-xs text-gray-600">Secundária</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border border-gray-200 mb-2"
              style={{ backgroundColor: settings.site_accent_color_1 }}
            ></div>
            <p className="text-xs text-gray-600">Destaque 1</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border border-gray-200 mb-2"
              style={{ backgroundColor: settings.site_accent_color_2 }}
            ></div>
            <p className="text-xs text-gray-600">Destaque 2</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border border-gray-200 mb-2"
              style={{ backgroundColor: settings.site_background_color_light }}
            ></div>
            <p className="text-xs text-gray-600">Fundo Claro</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border border-gray-200 mb-2"
              style={{ backgroundColor: settings.site_background_color_dark }}
            ></div>
            <p className="text-xs text-gray-600">Fundo Escuro</p>
          </div>
        </div>
      </Card>

      {/* Cores Primárias */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Paintbrush className="h-5 w-5 text-red-600" />
          Cores Primárias (Cabeçalho, Botões Principais)
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <ColorInput
            label="Cor Inicial do Gradiente"
            name="site_primary_color_from"
            value={settings.site_primary_color_from}
            description="Cor principal usada no cabeçalho e botões"
            handleChange={handleChange}
          />
          <ColorInput
            label="Cor Final do Gradiente"
            name="site_primary_color_to"
            value={settings.site_primary_color_to}
            description="Segunda cor para criar gradiente"
            handleChange={handleChange}
          />
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="site_use_primary_gradient"
                checked={settings.site_use_primary_gradient}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Usar Gradiente Primário (se desmarcado, usa apenas a primeira cor)
              </span>
            </label>
          </div>
        </div>
      </Card>

      {/* Cores Secundárias */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Square className="h-5 w-5 text-blue-600" />
          Cores Secundárias (Botões Secundários, Destaques)
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <ColorInput
            label="Cor Inicial do Gradiente"
            name="site_secondary_color_from"
            value={settings.site_secondary_color_from}
            description="Cor secundária para botões e elementos de destaque"
            handleChange={handleChange}
          />
          <ColorInput
            label="Cor Final do Gradiente"
            name="site_secondary_color_to"
            value={settings.site_secondary_color_to}
            description="Segunda cor para criar gradiente secundário"
            handleChange={handleChange}
          />
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="site_use_secondary_gradient"
                checked={settings.site_use_secondary_gradient}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Usar Gradiente Secundário
              </span>
            </label>
          </div>
        </div>
      </Card>

      {/* Cores de Texto e Fontes */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Type className="h-5 w-5 text-gray-600" />
          Cores de Texto e Fontes
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <ColorInput
            label="Texto Escuro"
            name="site_text_color_dark"
            value={settings.site_text_color_dark}
            description="Cor para textos em fundos claros"
            handleChange={handleChange}
          />
          <ColorInput
            label="Texto Claro"
            name="site_text_color_light"
            value={settings.site_text_color_light}
            description="Cor para textos em fundos escuros"
            handleChange={handleChange}
          />
          <ColorInput
            label="Texto dos Botões"
            name="site_button_text_color"
            value={settings.site_button_text_color}
            description="Cor do texto dentro dos botões"
            handleChange={handleChange}
          />
          <ColorInput
            label="Texto do Cabeçalho"
            name="site_header_text_color"
            value={settings.site_header_text_color}
            description="Cor do texto no cabeçalho do site"
            handleChange={handleChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fonte do Cabeçalho
            </label>
            <select
              name="site_header_font_family"
              value={settings.site_header_font_family}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {availableFonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Fonte usada no cabeçalho e em títulos
            </p>
          </div>
        </div>
      </Card>

      {/* Cores de Fundo */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Square className="h-5 w-5 text-gray-400" />
          Cores de Fundo
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <ColorInput
            label="Fundo Claro"
            name="site_background_color_light"
            value={settings.site_background_color_light}
            description="Cor de fundo para seções claras"
            handleChange={handleChange}
          />
          <ColorInput
            label="Fundo Escuro"
            name="site_background_color_dark"
            value={settings.site_background_color_dark}
            description="Cor de fundo para seções escuras"
            handleChange={handleChange}
          />
        </div>
      </Card>

      {/* Cores de Destaque */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Paintbrush className="h-5 w-5 text-amber-600" />
          Cores de Destaque
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <ColorInput
            label="Destaque 1"
            name="site_accent_color_1"
            value={settings.site_accent_color_1}
            description="Cor para elementos de destaque e ícones"
            handleChange={handleChange}
          />
          <ColorInput
            label="Destaque 2"
            name="site_accent_color_2"
            value={settings.site_accent_color_2}
            description="Segunda cor de destaque para variações"
            handleChange={handleChange}
          />
        </div>
      </Card>

      {/* Exemplo de Aplicação */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Exemplo de Aplicação</h4>
        <div className="space-y-4">
          {/* Exemplo de cabeçalho */}
          <div
            className="p-4 rounded-lg text-white"
            style={{
              background: settings.site_use_primary_gradient
                ? `linear-gradient(to right, ${settings.site_primary_color_from}, ${settings.site_primary_color_to})`
                : settings.site_primary_color_from,
              color: settings.site_header_text_color,
              fontFamily: settings.site_header_font_family,
            }}
          >
            <h5 className="font-bold">Exemplo de Cabeçalho</h5>
            <p className="text-sm opacity-90">Como ficará o cabeçalho do site</p>
          </div>

          {/* Exemplo de botões */}
          <div className="flex gap-4 flex-wrap">
            <button
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
              style={{
                background: settings.site_use_primary_gradient
                  ? `linear-gradient(to right, ${settings.site_primary_color_from}, ${settings.site_primary_color_to})`
                  : settings.site_primary_color_from,
                color: settings.site_button_text_color
              }}
            >
              Botão Primário
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
              style={{
                background: settings.site_use_secondary_gradient
                  ? `linear-gradient(to right, ${settings.site_secondary_color_from}, ${settings.site_secondary_color_to})`
                  : settings.site_secondary_color_from,
                color: settings.site_button_text_color
              }}
            >
              Botão Secundário
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium border-2 transition-all duration-200"
              style={{
                borderColor: settings.site_primary_color_from,
                color: settings.site_primary_color_from,
                backgroundColor: 'transparent'
              }}
            >
              Botão Outline
            </button>
          </div>

          {/* Exemplo de texto */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: settings.site_background_color_light }}
          >
            <h5
              className="font-bold mb-2"
              style={{ color: settings.site_text_color_dark }}
            >
              Exemplo de Texto Escuro
            </h5>
            <p
              className="text-sm"
              style={{ color: settings.site_text_color_dark }}
            >
              Este é um exemplo de como o texto ficará em fundos claros.
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: settings.site_background_color_dark }}
          >
            <h5
              className="font-bold mb-2"
              style={{ color: settings.site_text_color_light }}
            >
              Exemplo de Texto Claro
            </h5>
            <p
              className="text-sm"
              style={{ color: settings.site_text_color_light }}
            >
              Este é um exemplo de como o texto ficará em fundos escuros.
            </p>
          </div>
        </div>
      </Card>

      {/* Instruções */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="text-lg font-semibold text-blue-800 mb-4">Como Usar</h4>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• <strong>Prévia:</strong> Clique em "Prévia" para ver as mudanças em tempo real</p>
          <p>• <strong>Salvar:</strong> Clique em "Salvar" para aplicar permanentemente as cores</p>
          <p>• <strong>Gradientes:</strong> Desmarque a opção de gradiente para usar cores sólidas</p>
          <p>• <strong>Restaurar:</strong> Use "Restaurar Padrão" para voltar às cores originais</p>
          <p>• <strong>Cores Hex:</strong> Use formato #RRGGBB (ex: #FF0000 para vermelho)</p>
        </div>
      </Card>
    </div>
  );
};