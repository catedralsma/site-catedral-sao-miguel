import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Church, Calendar, MapPin, Award, BookOpen, Star, Sparkles, Phone, Mail, Clock, MessageCircle, User, Heart, Gift } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import { supabase } from '../lib/supabase';

interface CapelaPageProps {
  onBack: () => void;
  onNavigateToDonation?: () => void;
}

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
  capela_services_info: 'Serviços Disponíveis:\n• Missas e celebrações\n• Confissões (30 min antes das missas)\n• Batizados (agendar com antecedência)\n• Casamentos (agendar com 6 meses de antecedência)\n• Visitas guiadas para grupos (agendar)\n• Bênçãos especiais\n• Orientação espiritual'
};

export const CapelaPage: React.FC<CapelaPageProps> = ({ onBack, onNavigateToDonation }) => {
  const [settings, setSettings] = useState<CapelaSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCapelaSettings();
  }, []);

  const fetchCapelaSettings = async () => {
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
        if (setting.key === 'capela_enabled') {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phone = settings.capela_whatsapp;
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const message = encodeURIComponent('Olá! Gostaria de saber mais sobre a Capela São Miguel.');
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    }
  };

  const handleEmailClick = () => {
    if (settings.capela_email) {
      window.open(`mailto:${settings.capela_email}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary-from)' }}></div>
          <p className="text-gray-600">Carregando informações da capela...</p>
        </div>
      </div>
    );
  }

  if (!settings.capela_enabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <Church className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Página da Capela Desabilitada
          </h3>
          <p className="text-gray-500 mb-4">
            A página da Capela São Miguel está temporariamente desabilitada.
          </p>
          <Button variant="primary" onClick={onBack}>
            Voltar ao Site
          </Button>
        </Card>
      </div>
    );
  }

  const historyParagraphs = settings.capela_history.split('\n').filter(p => p.trim());

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="text-white shadow-lg sticky top-0 z-50 safe-area-inset-top" style={{ background: 'linear-gradient(to right, var(--color-primary-from), var(--color-primary-to))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Button
                variant="outline"
                onClick={onBack}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-1 sm:gap-2 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">{settings.capela_title}</h1>
                <p className="text-sm sm:text-base truncate" style={{ color: 'var(--color-accent-2)' }}>
                  {settings.capela_subtitle}
                </p>
              </div>
            </div>
            <Church className="h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0" style={{ color: 'var(--color-accent-2)' }} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <Card className="overflow-hidden">
            {settings.capela_image_url && (
              <div className="aspect-video overflow-hidden">
                <OptimizedImage
                  src={settings.capela_image_url}
                  alt={settings.capela_title}
                  publicId={settings.capela_cloudinary_public_id || undefined}
                  width={800}
                  height={450}
                  quality={40}
                  className="w-full h-full object-cover"
                  priority={true}
                />
              </div>
            )}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--color-primary-from)' }}>
                  {settings.capela_title}
                </h2>
                <p className="text-xl sm:text-2xl mb-4" style={{ color: 'var(--color-secondary-from)' }}>
                  {settings.capela_subtitle}
                </p>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  {settings.capela_description}
                </p>
                
                {/* Botão de Doação */}
                {onNavigateToDonation && (
                  <div className="mt-8">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={onNavigateToDonation}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Heart className="h-5 w-5" />
                      Colabore com a Capela
                    </Button>
                  </div>
                )}
              </div>

              {/* Informações Destacadas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-800 mx-auto mb-2" />
                  <h4 className="font-bold text-blue-900 text-lg">{settings.capela_founded_year}</h4>
                  <p className="text-blue-700 text-sm">Ano de Fundação</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Award className="h-8 w-8 text-green-800 mx-auto mb-2" />
                  <h4 className="font-bold text-green-900 text-lg">{settings.capela_tombamento_year}</h4>
                  <p className="text-green-700 text-sm">Tombamento</p>
                </div>

                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Star className="h-8 w-8 text-amber-800 mx-auto mb-2" />
                  <h4 className="font-bold text-amber-900 text-lg">{new Date().getFullYear() - settings.capela_founded_year}+</h4>
                  <p className="text-amber-700 text-sm">Anos de História</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <MapPin className="h-8 w-8 text-purple-800 mx-auto mb-2" />
                  <h4 className="font-bold text-purple-900 text-sm">Mais Antigo</h4>
                  <p className="text-purple-700 text-sm">de São Paulo</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* História Detalhada */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
              <h3 className="text-2xl font-bold text-gray-800">História da Capela</h3>
            </div>

            <div className="prose prose-lg max-w-none">
              {historyParagraphs.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-gray-700 leading-relaxed mb-6 text-justify"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Informações Técnicas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600" />
                Patrimônio Histórico
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">Tombamento</h4>
                  <p className="text-amber-700 text-sm">{settings.capela_tombamento_process}</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Nome Popular</h4>
                  <p className="text-blue-700 text-sm">"{settings.capela_popular_name}"</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Localização
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Endereço</h4>
                  <p className="text-green-700 text-sm">{settings.capela_location}</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Importância</h4>
                  <p className="text-gray-700 text-sm">Templo religioso mais antigo da cidade de São Paulo</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Informações de Contato e Horários */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contato */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                Contato da Capela
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Telefone</p>
                    <p className="text-blue-800 font-semibold">{settings.capela_phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">E-mail</p>
                    <p className="text-gray-800 font-semibold">{settings.capela_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Responsável</p>
                    <p className="text-gray-800 font-semibold">{settings.capela_contact_person}</p>
                  </div>
                </div>

                {/* Botões de Contato */}
                <div className="space-y-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleWhatsAppClick}
                    className="w-full flex items-center justify-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp: {settings.capela_whatsapp}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleEmailClick}
                    className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                  >
                    <Mail className="h-4 w-4" />
                    Enviar E-mail
                  </Button>
                </div>
              </div>
            </Card>

            {/* Horários */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Horários e Visitação
              </h3>
              
              <div className="space-y-6">
                {/* Horários das Missas */}
                <div>
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Church className="h-4 w-4" />
                    Horários das Missas
                  </h4>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    {settings.capela_mass_schedule.split('\n').map((line, index) => (
                      <p key={index} className="text-purple-700 text-sm mb-1">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Horários de Visitação */}
                <div>
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Horários de Visitação
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    {settings.capela_visiting_hours.split('\n').map((line, index) => (
                      <p key={index} className="text-blue-700 text-sm mb-1">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Serviços e Atendimentos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3" style={{ color: 'var(--color-text-dark)' }}>
              <BookOpen className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
              Serviços e Atendimentos
            </h3>
            
            <div className="prose prose-lg max-w-none">
              {settings.capela_services_info.split('\n').map((line, index) => {
                if (line.trim() === '') return <br key={index} />;
                
                // Títulos (linhas que terminam com :)
                if (line.endsWith(':')) {
                  return (
                    <h4 key={index} className="text-lg font-bold mt-6 mb-3" style={{ color: 'var(--color-primary-from)' }}>
                      {line}
                    </h4>
                  );
                }
                
                // Itens de lista (linhas que começam com •)
                if (line.startsWith('•')) {
                  return (
                    <p key={index} className="text-gray-700 mb-2 ml-4">
                      {line}
                    </p>
                  );
                }
                
                // Texto normal
                return (
                  <p key={index} className="text-gray-700 mb-3 leading-relaxed">
                    {line}
                  </p>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Significado Espiritual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-16"
        >
          <Card className="p-8 text-center" style={{ background: 'linear-gradient(to right, var(--color-accent-2), var(--color-accent-1))', opacity: 0.1 }}>
            <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-primary-from)' }} />
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary-from)' }}>
              São Miguel Arcanjo
            </h3>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-dark)' }}>
              São Miguel faz parte da alta hierarquia dos anjos e seus cultos pede proteção e iluminação ao caminho de Deus. 
              A capela representa não apenas um marco histórico, mas um símbolo da fé que une passado e presente em nossa comunidade.
            </p>
          </Card>
        </motion.div>

        {/* Mapa */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-dark)' }}>
              Como Chegar à Capela
            </h3>
            
            <div className="aspect-video rounded-lg overflow-hidden mb-6">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3659.1011515181385!2d-46.44790648934923!3d-23.492865858990694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce6164c743f801%3A0xd7d15a848c73427d!2sCapela%20S%C3%A3o%20Miguel%20Arcanjo!5e0!3m2!1spt-BR!2sbr!4v1758541905588!5m2!1spt-BR!2sbr" 
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Capela São Miguel"
              ></iframe>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                <strong>Endereço:</strong> {settings.capela_location}
              </p>
              <p className="text-sm text-gray-500">
                Próximo ao metrô São Miguel Paulista • Centro histórico de São Miguel Paulista
              </p>
            </div>

            {/* Informações de Contato no Mapa */}
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800 mb-1">Telefone</h4>
                <p className="text-blue-700 text-sm">{settings.capela_phone}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800 mb-1">WhatsApp</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsAppClick}
                  className="text-green-600 hover:text-green-700 border-green-300"
                >
                  Conversar
                </Button>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <Mail className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-800 mb-1">E-mail</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailClick}
                  className="text-gray-600 hover:text-gray-700 border-gray-300"
                >
                  Enviar
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};