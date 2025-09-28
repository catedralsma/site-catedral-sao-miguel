import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Phone, Mail, Clock, MessageCircle, Facebook, Instagram, Youtube } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, Parish } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ContactSectionProps {
  onNavigate: (section: string) => void;
  isFullPage?: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onNavigate, isFullPage = false }) => {
  const [parish, setParish] = useState<Parish | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParishData();
  }, []);

  const fetchParishData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('parishes')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setParish(data);
      } else {
        // Dados padrão da Catedral de São Miguel Arcanjo
        const defaultParish: Parish = {
          id: '1',
          name: 'Catedral de São Miguel Arcanjo',
          history: '',
          founded_year: 1622,
          address: 'Praça Pe. Aleixo Monteiro Mafra, 11 - São Miguel Paulista, São Paulo - SP, 08010-000',
          phone: '(11) 2032-4160',
          email: 'contato@catedralsaomiguel.com.br',
          whatsapp_number: '11999999999',
          facebook_username: 'catedralsaomiguel',
          instagram_username: 'catedral_sm',
          twitter_username: 'catedralsm',
          youtube_channel: '@catedralsaomiguel',
          logo_url: null,
          logo_url_dark: null,
          logo_url_light: null,
          cloudinary_public_id: null,
          cloudinary_public_id_dark: null,
          cloudinary_public_id_light: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setParish(defaultParish);
      }
    } catch (error) {
      console.error('Error fetching parish data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phone = parish?.whatsapp_number || parish?.phone?.replace(/\D/g, '');
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const message = encodeURIComponent('Olá! Gostaria de entrar em contato com a Catedral de São Miguel Arcanjo.');
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    }
  };

  const handleEmailClick = () => {
    if (parish?.email) {
      window.open(`mailto:${parish.email}`, '_blank');
    }
  };

  const handleFacebookClick = () => {
    if (parish?.facebook_username) {
      window.open(`https://facebook.com/${parish.facebook_username}`, '_blank');
    }
  };

  const handleInstagramClick = () => {
    if (parish?.instagram_username) {
      window.open(`https://instagram.com/${parish.instagram_username}`, '_blank');
    }
  };

  const handleTwitterClick = () => {
    if (parish?.twitter_username) {
      window.open(`https://twitter.com/${parish.twitter_username}`, '_blank');
    }
  };

  const handleYouTubeClick = () => {
    if (parish?.youtube_channel) {
      const channel = parish.youtube_channel.startsWith('@') 
        ? parish.youtube_channel 
        : `c/${parish.youtube_channel}`;
      window.open(`https://youtube.com/${channel}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary-from)' }}></div>
            <p className="text-gray-600">Carregando informações de contato...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header - apenas quando acessada como página individual */}
      {isFullPage && (
        <div className="text-white shadow-lg sticky top-0 z-50 safe-area-inset-top" style={{ background: 'linear-gradient(to right, var(--color-primary-from), var(--color-primary-to))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <Button
                  variant="outline"
                  onClick={() => onNavigate('home')}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-1 sm:gap-2 flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Voltar</span>
                </Button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold">Entre em Contato</h1>
                  <p className="text-sm sm:text-base truncate" style={{ color: 'var(--color-accent-2)' }}>
                    Estamos aqui para ajudar e acolher você
                  </p>
                </div>
              </div>
              <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0" style={{ color: 'var(--color-accent-2)' }} />
            </div>
          </div>
        </div>
      )}
      
      <section id="contact" className={`${isFullPage ? 'py-20' : 'py-20'} bg-gray-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Título da seção - apenas na página inicial */}
          {!isFullPage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent" style={{
                background: 'linear-gradient(to right, var(--color-primary-from), var(--color-secondary-from))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}>
                Entre em Contato
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-dark)' }}>
                Estamos aqui para ajudar e acolher você em nossa comunidade
              </p>
            </motion.div>
          )}

          {/* Informações de Contato e Redes Sociais */}
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="p-8 h-full">
                <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-dark)' }}>
                  Informações de Contato
                </h3>

                <div className="space-y-6">
                  {/* Endereço */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--color-primary-from)' }}>
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text-dark)' }}>Endereço</h4>
                      <p className="text-gray-600 leading-relaxed">
                        {parish?.address || 'Praça Pe. Aleixo Monteiro Mafra, 11 - São Miguel Paulista, São Paulo - SP, 08010-000'}
                      </p>
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--color-primary-from)' }}>
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text-dark)' }}>Telefone</h4>
                      <p className="text-gray-600">
                        {parish?.phone || '(11) 2032-4160'}
                      </p>
                    </div>
                  </div>

                  {/* E-mail */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--color-primary-from)' }}>
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text-dark)' }}>E-mail</h4>
                      <p className="text-gray-600">
                        {parish?.email || 'contato@catedralsaomiguel.com.br'}
                      </p>
                    </div>
                  </div>

                  {/* Horários */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--color-primary-from)' }}>
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text-dark)' }}>Horário de Atendimento</h4>
                      <div className="text-gray-600 space-y-1">
                        {parish?.business_hours ? (
                          parish.business_hours.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                          ))
                        ) : (
                          <>
                            <p>Segunda a Sexta: 9h às 17h</p>
                            <p>Sábado: 9h às 12h</p>
                            <p>Domingo: Após as missas</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </Card>
            </motion.div>

            {/* Contato Rápido e Redes Sociais */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="p-8 h-full">
                <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-dark)' }}>
                  Contato Rápido
                </h3>

                {/* Botões de Contato Rápido */}
                <div className="mb-8">
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text-dark)' }}>
                    Entre em Contato
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {/* WhatsApp */}
                    {(parish?.whatsapp_number || parish?.phone) && (
                      <Button
                        variant="outline"
                        onClick={handleWhatsAppClick}
                        className="flex items-center justify-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        WhatsApp
                      </Button>
                    )}

                    {/* E-mail */}
                    {parish?.email && (
                      <Button
                        variant="outline"
                        onClick={handleEmailClick}
                        className="flex items-center justify-center gap-2 hover:bg-gray-100"
                        style={{ 
                          color: 'var(--color-primary-from)',
                          borderColor: 'var(--color-primary-from)'
                        }}
                      >
                        <Mail className="h-4 w-4" />
                        E-mail
                      </Button>
                    )}
                  </div>
                </div>

                {/* Redes Sociais */}
                <div>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text-dark)' }}>
                    Siga-nos nas Redes Sociais
                  </h4>
                  <div className="flex gap-3 flex-wrap">
                    {/* Facebook */}
                    {parish?.facebook_username && (
                      <Button
                        variant="outline"
                        onClick={handleFacebookClick}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </Button>
                    )}

                    {/* Instagram */}
                    {parish?.instagram_username && (
                      <Button
                        variant="outline"
                        onClick={handleInstagramClick}
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50 border-pink-300"
                      >
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </Button>
                    )}

                    {/* Twitter/X */}
                    {parish?.twitter_username && (
                      <Button
                        variant="outline"
                        onClick={handleTwitterClick}
                        className="flex items-center gap-2 text-gray-800 hover:text-gray-900 hover:bg-gray-100 border-gray-400"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Twitter
                      </Button>
                    )}

                    {/* YouTube */}
                    {parish?.youtube_channel && (
                      <Button
                        variant="outline"
                        onClick={handleYouTubeClick}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                      >
                        <Youtube className="h-4 w-4" />
                        YouTube
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Mapa e Informações Adicionais */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16"
          >
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-dark)' }}>
                Como Chegar
              </h3>
              
              <div className="aspect-video rounded-lg overflow-hidden mb-6">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3659.1011515181385!2d-46.44790648934923!3d-23.492865858990694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce6164c743f801%3A0xd7d15a848c73427d!2sCatedral%20S%C3%A3o%20Miguel%20Arcanjo!5e0!3m2!1spt-BR!2sbr!4v1758541905588!5m2!1spt-BR!2sbr" 
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização da Catedral de São Miguel Arcanjo"
                ></iframe>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="p-4 rounded-full mx-auto mb-3 w-16 h-16 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-from)' }}>
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-dark)' }}>Localização</h4>
                  <p className="text-gray-600 text-sm">
                    Centro de São Miguel Paulista, próximo ao metrô São Miguel Paulista
                  </p>
                </div>

                <div>
                  <div className="p-4 rounded-full mx-auto mb-3 w-16 h-16 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-from)' }}>
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-dark)' }}>Atendimento</h4>
                  <p className="text-gray-600 text-sm">
                    Secretaria paroquial aberta de segunda a sábado
                  </p>
                </div>

                <div>
                  <div className="p-4 rounded-full mx-auto mb-3 w-16 h-16 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-from)' }}>
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-dark)' }}>Contato Direto</h4>
                  <p className="text-gray-600 text-sm">
                    WhatsApp disponível para dúvidas e agendamentos
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Footer com Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 text-center"
          >
            <Card className="p-6 bg-gray-100">
              {/* Logo do rodapé */}
              <div className="text-center mb-4">
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
                {/* Logo do rodapé */}
                {parish?.logo_url_dark ? (
                  <img
                    src={parish.logo_url_dark}
                    alt="Logo da Catedral"
                    className="w-16 h-auto object-contain opacity-80"
                  />
                ) : parish?.logo_url ? (
                  <img
                    src={parish.logo_url}
                    alt="Logo da Catedral"
                    className="w-16 h-auto object-contain opacity-80"
                  />
                ) : (
                  <img
                    src="/footer.webp"
                    alt="Logo da Catedral"
                    className="w-24 h-auto object-contain opacity-80"
                  />
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600 mt-4">
                <span>© 2025 Catedral de São Miguel Arcanjo</span>
                <span className="hidden sm:inline">•</span>
                <button
                  onClick={() => onNavigate('privacy-policy')}
                  className="hover:text-red-800 transition-colors underline"
                >
                  Política de Privacidade
                </button>
                <span className="hidden sm:inline">•</span>
                <button
                  onClick={() => onNavigate('terms-of-use')}
                  className="hover:text-red-800 transition-colors underline"
                >
                  Termos de Uso
                </button>
                <span className="hidden sm:inline">•</span>
                <span>Desenvolvido por: <a href="https://instagram.com/guthierresc" target="_blank" rel="noopener noreferrer" className="hover:text-red-800 transition-colors font-medium">Sem. Guthierres</a></span>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};