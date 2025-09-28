import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Church, Image as ImageIcon, Upload, Eye, EyeOff, Building, BookOpen, Heart, Calendar, DollarSign, CreditCard, Star, Phone, Mail, Clock, Gift, Shield, Info, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CapelaSettings {
  capela_enabled: boolean;
  capela_title: string;
  capela_subtitle: string;
  capela_description: string;
  capela_history: string;
  capela_founded_year: number;
  capela_tombamento_year: number;
  capela_tombamento_process: string;
  capela_location: string;
  capela_popular_name: string;
  capela_image_url: string;
  capela_cloudinary_public_id: string;
  capela_phone: string;
  capela_email: string;
  capela_whatsapp: string;
  capela_contact_person: string;
  capela_mass_schedule: string;
  capela_visiting_hours: string;
  capela_services_info: string;
  // Donation settings
  capela_donation_enabled: boolean;
  capela_donation_title: string;
  capela_donation_subtitle: string;
  capela_donation_description: string;
  capela_pix_key: string;
  capela_pix_name: string;
  capela_pix_description: string;
  capela_bank_name: string;
  capela_bank_agency: string;
  capela_bank_account: string;
  capela_bank_account_type: string;
  capela_bank_cnpj: string;
  capela_donation_methods: string;
  capela_donation_purposes: string;
  capela_stripe_enabled: boolean;
  capela_donation_thanks_message: string;
  capela_donation_contact_info: string;
  capela_suggested_amounts: string;
  capela_minimum_amount: string;
  capela_transparency_enabled: boolean;
  capela_transparency_text: string;
}

const defaultSettings: CapelaSettings = {
  capela_enabled: true,
  capela_title: 'Capela São Miguel',
  capela_subtitle: 'Igreja de São Miguel Paulista',
  capela_description: 'O templo religioso mais antigo da cidade de São Paulo, construído pelos índios guaianás catequizados pelos jesuítas em 1560.',
  capela_history: 'Igreja de São Miguel Paulista ou Capela de São Miguel Arcanjo, conhecida popularmente como Capela dos Índios, é o templo religioso mais antigo da cidade de São Paulo.',
  capela_founded_year: 1560,
  capela_tombamento_year: 1938,
  capela_tombamento_process: 'Processo 180-T, inscrição 109 no Livro Histórico e 219 no Livro Belas Artes',
  capela_location: 'Praça Padre Aleixo Monteiro Mafra (Praça do Forró), São Miguel Paulista, São Paulo',
  capela_popular_name: 'Capela dos Índios',
  capela_image_url: '',
  capela_cloudinary_public_id: '',
  capela_phone: '(11) 2032-4160',
  capela_email: 'capela@catedralsaomiguel.com.br',
  capela_whatsapp: '11999999999',
  capela_contact_person: 'Secretaria da Capela',
  capela_mass_schedule: 'Domingo: 8h, 10h, 19h\nSegunda a Sexta: 19h30\nSábado: 19h',
  capela_visiting_hours: 'Segunda a Sexta: 9h às 17h\nSábado: 9h às 12h\nDomingo: 8h às 20h\nFeriados: Consultar',
  capela_services_info: 'Serviços Disponíveis:\n• Missas e celebrações\n• Confissões (30 min antes das missas)\n• Batizados (agendar com antecedência)\n• Casamentos (agendar com 6 meses de antecedência)\n• Visitas guiadas para grupos (agendar)\n• Bênçãos especiais\n• Orientação espiritual',
  // Donation settings
  capela_donation_enabled: true,
  capela_donation_title: 'Colabore com a Capela São Miguel',
  capela_donation_subtitle: 'Ajude a preservar o templo mais antigo de São Paulo',
  capela_donation_description: 'Sua doação é fundamental para a manutenção e preservação da Capela São Miguel, um patrimônio histórico de mais de 460 anos.',
  capela_pix_key: '',
  capela_pix_name: 'Capela São Miguel Arcanjo',
  capela_pix_description: 'Doação para manutenção da Capela São Miguel',
  capela_bank_name: '',
  capela_bank_agency: '',
  capela_bank_account: '',
  capela_bank_account_type: 'Conta Corrente',
  capela_bank_cnpj: '',
  capela_donation_methods: 'PIX (instantâneo)\nTransferência Bancária\nCartão de Crédito (em breve)\nDoação Presencial na Capela',
  capela_donation_purposes: 'Manutenção do patrimônio histórico\nRestauração de elementos arquitetônicos\nConservação dos vitrais centenários\nMelhorias na infraestrutura\nAções sociais da capela\nEventos e celebrações especiais',
  capela_stripe_enabled: false,
  capela_donation_thanks_message: 'Muito obrigado pela sua generosidade! Sua doação será fundamental para a preservação da Capela São Miguel.',
  capela_donation_contact_info: 'Para dúvidas sobre doações, entre em contato:\nTelefone: (11) 2032-4160\nE-mail: doacoes@catedralsaomiguel.com.br',
  capela_suggested_amounts: '25,50,100,200,500',
  capela_minimum_amount: '10',
  capela_transparency_enabled: true,
  capela_transparency_text: 'Todas as doações são utilizadas exclusivamente para a manutenção e preservação da Capela São Miguel. Relatórios de prestação de contas estão disponíveis mediante solicitação.'
};

export const CapelaManager: React.FC = () => {
  const [settings, setSettings] = useState<CapelaSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<'info' | 'donation'>('info');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const settingKeys = Object.keys(defaultSettings) as Array<keyof CapelaSettings>;
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', settingKeys);

      if (error) throw error;

      const fetchedSettings: Partial<CapelaSettings> = {};
      data?.forEach(setting => {
        if (setting.key === 'capela_enabled' || setting.key === 'capela_donation_enabled' || setting.key === 'capela_stripe_enabled' || setting.key === 'capela_transparency_enabled') {
          fetchedSettings[setting.key] = setting.value === 'true';
        } else if (setting.key === 'capela_founded_year' || setting.key === 'capela_tombamento_year') {
          fetchedSettings[setting.key as keyof CapelaSettings] = parseInt(setting.value) as any;
        } else {
          fetchedSettings[setting.key as keyof CapelaSettings] = setting.value as any;
        }
      });

      setSettings(prev => ({ ...prev, ...fetchedSettings }));
    } catch (error) {
      console.error('Error fetching capela settings:', error);
      toast.error('Erro ao carregar configurações da capela');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? value.toString() : value.toString(),
        description: `Capela setting: ${key}`,
        is_encrypted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      toast.success('Configurações da capela salvas com sucesso!');
    } catch (error) {
      console.error('Error saving capela settings:', error);
      toast.error('Erro ao salvar configurações da capela');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande (máximo 10MB)');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `capela-${Date.now()}.${fileExt}`;
      const filePath = `capela/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('parish-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('parish-photos')
        .getPublicUrl(filePath);

      setSettings(prev => ({ ...prev, capela_image_url: urlData.publicUrl }));
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloudinaryUpload = async (result: { publicId: string; url: string; secureUrl: string }) => {
    setSettings(prev => ({ 
      ...prev, 
      capela_image_url: result.secureUrl,
      capela_cloudinary_public_id: result.publicId 
    }));
    toast.success('Imagem carregada com sucesso!');
  };

  const handleSupabaseUpload = async (result: { url: string; path: string }) => {
    setSettings(prev => ({ ...prev, capela_image_url: result.url }));
    toast.success('Imagem carregada com sucesso!');
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
          <Church className="h-7 w-7 text-blue-600" />
          Gerenciar Capela São Miguel
        </h3>
        <div className="flex gap-2">
          <Button
            variant={activeSection === 'info' ? 'primary' : 'outline'}
            onClick={() => setActiveSection('info')}
            size="sm"
          >
            <Church className="h-4 w-4" />
            Informações
          </Button>
          <Button
            variant={activeSection === 'donation' ? 'primary' : 'outline'}
            onClick={() => setActiveSection('donation')}
            size="sm"
          >
            <Heart className="h-4 w-4" />
            Doações
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

      {activeSection === 'info' ? (
        /* Seção de Informações da Capela */
        <div className="space-y-6">
          {/* Status da Capela */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Status da Página da Capela
            </h4>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.capela_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {settings.capela_enabled ? '✅ Página da Capela Ativa' : '❌ Página da Capela Desabilitada'}
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Quando desabilitada, a página da capela não será acessível aos visitantes
            </p>
          </Card>

          {/* Informações Básicas */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Capela
                </label>
                <input
                  type="text"
                  value={settings.capela_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Capela São Miguel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={settings.capela_subtitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Igreja de São Miguel Paulista"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Principal
              </label>
              <textarea
                value={settings.capela_description}
                onChange={(e) => setSettings(prev => ({ ...prev, capela_description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Descrição que aparece no topo da página"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano de Fundação
                </label>
                <input
                  type="number"
                  value={settings.capela_founded_year}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_founded_year: parseInt(e.target.value) || 1560 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano do Tombamento
                </label>
                <input
                  type="number"
                  value={settings.capela_tombamento_year}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_tombamento_year: parseInt(e.target.value) || 1938 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Popular
                </label>
                <input
                  type="text"
                  value={settings.capela_popular_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_popular_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Capela dos Índios"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Processo de Tombamento
              </label>
              <input
                type="text"
                value={settings.capela_tombamento_process}
                onChange={(e) => setSettings(prev => ({ ...prev, capela_tombamento_process: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Processo 180-T, inscrição 109 no Livro Histórico..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <input
                type="text"
                value={settings.capela_location}
                onChange={(e) => setSettings(prev => ({ ...prev, capela_location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Endereço completo da capela"
              />
            </div>
          </Card>

          {/* Horários */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Horários e Atendimento
            </h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horários das Missas
                </label>
                <textarea
                  value={settings.capela_mass_schedule}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_mass_schedule: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Domingo: 8h, 10h, 19h&#10;Segunda a Sexta: 19h30..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horários de Visitação
                </label>
                <textarea
                  value={settings.capela_visiting_hours}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_visiting_hours: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Segunda a Sexta: 9h às 17h&#10;Sábado: 9h às 12h..."
                />
              </div>
            </div>
          </Card>

          {/* Nosso Clero */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Nosso Clero
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável pela Capela
                </label>
                <input
                  type="text"
                  value={settings.capela_contact_person}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_contact_person: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Pe. João Silva"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">ℹ️ Informação</p>
                    <p>As informações detalhadas do clero são gerenciadas na seção "Clero" do painel administrativo. Aqui você pode definir apenas o responsável principal pela capela.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Imagem da Capela */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Imagem Principal da Capela</h4>
            {settings.capela_image_url && (
              <div className="mb-4">
                <img
                  src={settings.capela_image_url}
                  alt="Capela São Miguel"
                  className="w-full h-64 object-cover rounded-lg"
                />
                {settings.capela_cloudinary_public_id && (
                  <p className="text-xs text-blue-600 mt-1">
                    Cloudinary: {settings.capela_cloudinary_public_id}
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <FileUpload
                onCloudinaryUpload={handleCloudinaryUpload}
                onSupabaseUpload={handleSupabaseUpload}
                onFileSelect={handleImageUpload}
                disabled={isUploading}
                className="flex-1"
                folder="capela"
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  className="w-full"
                >
                  <ImageIcon className="h-4 w-4" />
                  {isUploading ? 'Carregando...' : 'Carregar Imagem'}
                </Button>
              </FileUpload>
              {settings.capela_image_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    capela_image_url: '',
                    capela_cloudinary_public_id: ''
                  }))}
                  className="text-red-600"
                >
                  Remover
                </Button>
              )}
            </div>
          </Card>

          {/* História */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-600" />
              História da Capela
            </h4>
            <textarea
              value={settings.capela_history}
              onChange={(e) => setSettings(prev => ({ ...prev, capela_history: e.target.value }))}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="História detalhada da capela..."
            />
          </Card>

          {/* Contato */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              Informações de Contato da Capela
            </h4>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">ℹ️ Contatos Separados</p>
                  <p>Configure aqui os contatos específicos da Capela São Miguel, que podem ser diferentes dos contatos da Catedral principal.</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone da Capela
                </label>
                <input
                  type="text"
                  value={settings.capela_phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 2032-4160"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail da Capela
                </label>
                <input
                  type="email"
                  value={settings.capela_email}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="capela@catedralsaomiguel.com.br"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp da Capela
                </label>
                <input
                  type="text"
                  value={settings.capela_whatsapp}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_whatsapp: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="11999999999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável/Contato
                </label>
                <input
                  type="text"
                  value={settings.capela_contact_person}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_contact_person: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Secretaria da Capela"
                />
              </div>
            </div>
          </Card>

          {/* Serviços */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Serviços e Atendimentos</h4>
            <textarea
              value={settings.capela_services_info}
              onChange={(e) => setSettings(prev => ({ ...prev, capela_services_info: e.target.value }))}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Serviços Disponíveis:&#10;• Missas e celebrações&#10;• Confissões..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Use • para criar listas e deixe linhas em branco para separar seções
            </p>
          </Card>
        </div>
      ) : (
        /* Seção de Doações */
        <div className="space-y-6">
          {/* Status das Doações */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" />
              Sistema de Doações
            </h4>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.capela_donation_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_donation_enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {settings.capela_donation_enabled ? '✅ Sistema de Doações Ativo' : '❌ Sistema de Doações Desabilitado'}
                </span>
              </label>
            </div>
          </Card>

          {/* Informações das Doações */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Textos da Página de Doação</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Página
                </label>
                <input
                  type="text"
                  value={settings.capela_donation_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_donation_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Colabore com a Capela São Miguel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={settings.capela_donation_subtitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_donation_subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ajude a preservar o templo mais antigo de São Paulo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição Principal
                </label>
                <textarea
                  value={settings.capela_donation_description}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_donation_description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Descrição sobre a importância das doações..."
                />
              </div>
            </div>
          </Card>

          {/* PIX */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Configurações PIX
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={settings.capela_pix_key}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_pix_key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="chave@email.com ou CPF/CNPJ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Beneficiário
                </label>
                <input
                  type="text"
                  value={settings.capela_pix_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_pix_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Capela São Miguel Arcanjo"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição do PIX
              </label>
              <input
                type="text"
                value={settings.capela_pix_description}
                onChange={(e) => setSettings(prev => ({ ...prev, capela_pix_description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Doação para manutenção da Capela São Miguel"
              />
            </div>
          </Card>

          {/* Dados Bancários */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Dados Bancários
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Banco
                </label>
                <input
                  type="text"
                  value={settings.capela_bank_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_bank_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Banco do Brasil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agência
                </label>
                <input
                  type="text"
                  value={settings.capela_bank_agency}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_bank_agency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1234-5"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conta
                </label>
                <input
                  type="text"
                  value={settings.capela_bank_account}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_bank_account: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="12345-6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Conta
                </label>
                <select
                  value={settings.capela_bank_account_type}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_bank_account_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Conta Corrente">Conta Corrente</option>
                  <option value="Conta Poupança">Conta Poupança</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={settings.capela_bank_cnpj}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_bank_cnpj: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="12.345.678/0001-90"
                />
              </div>
            </div>
          </Card>

          {/* Configurações Avançadas */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Configurações Avançadas</h4>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valores Sugeridos (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={settings.capela_suggested_amounts}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_suggested_amounts: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="25,50,100,200,500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Finalidades das Doações
                </label>
                <textarea
                  value={settings.capela_donation_purposes}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_donation_purposes: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Manutenção do patrimônio histórico&#10;Restauração de elementos arquitetônicos..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Métodos de Doação Disponíveis
                </label>
                <textarea
                  value={settings.capela_donation_methods}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_donation_methods: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="PIX (instantâneo)&#10;Transferência Bancária..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem de Agradecimento
                </label>
                <textarea
                  value={settings.capela_donation_thanks_message}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_donation_thanks_message: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Mensagem que aparece após a doação..."
                />
              </div>
            </div>
          </Card>

          {/* Transparência */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Transparência e Prestação de Contas
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.capela_transparency_enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, capela_transparency_enabled: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mostrar seção de transparência
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto sobre Transparência
                </label>
                <textarea
                  value={settings.capela_transparency_text}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_transparency_text: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Informações sobre como as doações são utilizadas..."
                  disabled={!settings.capela_transparency_enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Informações de Contato para Doações
                </label>
                <textarea
                  value={settings.capela_donation_contact_info}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_donation_contact_info: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Para dúvidas sobre doações, entre em contato:&#10;Telefone: (11) 2032-4160..."
                />
              </div>
            </div>
          </Card>

          {/* Stripe (Cartão de Crédito) */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              Doações via Cartão (Stripe)
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.capela_stripe_enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, capela_stripe_enabled: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Habilitar doações via cartão de crédito (Stripe)
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Mínimo (R$)
                </label>
                <input
                  type="number"
                  value={settings.capela_minimum_amount}
                  onChange={(e) => setSettings(prev => ({ ...prev, capela_minimum_amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="10"
                  min="1"
                  step="0.01"
                  disabled={!settings.capela_stripe_enabled}
                />
              </div>

              {!settings.capela_stripe_enabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>💳 Stripe:</strong> Para habilitar doações via cartão, você precisará configurar uma conta no Stripe e integrar com o sistema.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};