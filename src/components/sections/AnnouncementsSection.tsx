import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Bell, MessageCircle, Clock, MapPin, X, Phone, ExternalLink } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, ParishAnnouncement } from '../../lib/supabase';

export const AnnouncementsSection: React.FC = () => {
  const [announcements, setAnnouncements] = useState<ParishAnnouncement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ParishAnnouncement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('parish_announcements')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAnnouncements(data);
      } else {
        // Anúncios padrão se não houver dados
        const defaultAnnouncements: ParishAnnouncement[] = [
          {
            id: '1',
            type: 'event',
            title: 'Festa de São Miguel Arcanjo',
            content: 'Celebração especial em honra ao nosso padroeiro São Miguel Arcanjo. Haverá missa solene às 10h, seguida de procissão e festa comunitária com barracas típicas, música e confraternização para toda a família.',
            event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias no futuro
            whatsapp_contact: '11999999999',
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            type: 'announcement',
            title: 'Horário Especial de Confissões',
            content: 'Durante o mês de preparação para a Páscoa, teremos horário estendido para confissões. Além dos horários habituais, estaremos disponíveis também às terças e quintas-feiras das 19h às 20h.',
            event_date: null,
            whatsapp_contact: null,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            type: 'event',
            title: 'Primeira Comunhão 2025',
            content: 'Inscrições abertas para a preparação da Primeira Comunhão 2025. As aulas começam em março e a celebração será em outubro. Crianças a partir de 8 anos podem participar.',
            event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias no futuro
            whatsapp_contact: '11999999999',
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            type: 'announcement',
            title: 'Grupo de Oração',
            content: 'Nosso grupo de oração se reúne todas as quartas-feiras às 20h no salão paroquial. Venha fortalecer sua fé conosco através da oração comunitária e partilha da Palavra.',
            event_date: null,
            whatsapp_contact: '11999999999',
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '5',
            type: 'event',
            title: 'Retiro Espiritual',
            content: 'Retiro espiritual para adultos com o tema "Renovando a Fé". Será realizado no próximo fim de semana das 8h às 17h. Inclui palestras, momentos de oração e reflexão.',
            event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 dias no futuro
            whatsapp_contact: '11999999999',
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '6',
            type: 'announcement',
            title: 'Campanha do Agasalho',
            content: 'Estamos arrecadando roupas de inverno para doação às famílias carentes da comunidade. Você pode deixar suas doações na secretaria paroquial de segunda a sexta, das 9h às 17h.',
            event_date: null,
            whatsapp_contact: null,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setAnnouncements(defaultAnnouncements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnnouncementClick = (announcement: ParishAnnouncement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleWhatsAppClick = (phone: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${selectedAnnouncement?.title}`);
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIcon = (type: string) => {
    return type === 'event' ? Calendar : Bell;
  };

  const getTypeLabel = (type: string) => {
    return type === 'event' ? 'Evento' : 'Aviso';
  };

  if (isLoading) {
    return (
      <section id="announcements" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary-from)' }}></div>
            <p className="text-gray-600">Carregando eventos e avisos...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="announcements" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Eventos e Avisos
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-700">
              Fique por dentro das novidades e eventos da nossa comunidade
            </p>
          </motion.div>

          {announcements.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum evento ou aviso no momento
              </h3>
              <p className="text-gray-500">
                Novos eventos e avisos aparecerão aqui quando forem publicados
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement, index) => {
                const IconComponent = getIcon(announcement.type);
                return (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => handleAnnouncementClick(announcement)}
                      className="w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl"
                      style={{ focusRingColor: 'var(--color-primary-from)' }}
                    >
                      <Card className="group h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-full ${
                              announcement.type === 'event' 
                                ? 'text-white'
                                : 'text-white'
                            }`} style={{
                              backgroundColor: announcement.type === 'event' 
                                ? 'var(--color-primary-from)'
                                : 'var(--color-secondary-from)'
                            }}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                announcement.type === 'event'
                                  ? 'text-white'
                                  : 'text-white'
                              }`} style={{
                                backgroundColor: announcement.type === 'event'
                                  ? 'var(--color-primary-from)'
                                  : 'var(--color-secondary-from)'
                              }}>
                                {getTypeLabel(announcement.type)}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-blue-800 transition-colors line-clamp-2">
                            {announcement.title}
                          </h3>

                          <p className="text-gray-600 mb-4 flex-1 line-clamp-3 text-sm leading-relaxed">
                            {announcement.content}
                          </p>

                          <div className="space-y-2">
                            {announcement.event_date && (
                              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span>{formatEventDate(announcement.event_date)}</span>
                              </div>
                            )}

                            {announcement.whatsapp_contact && (
                              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                <MessageCircle className="h-4 w-4" />
                                <span>Contato disponível</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>Publicado em {new Date(announcement.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center font-medium group-hover:opacity-80 transition-colors text-sm text-blue-600">
                              <span>Ver detalhes</span>
                              <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="text-white p-6" style={{ background: 'linear-gradient(to right, var(--color-primary-from), var(--color-primary-to))' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedAnnouncement.type === 'event' ? (
                      <Calendar className="h-6 w-6" />
                    ) : (
                      <Bell className="h-6 w-6" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{selectedAnnouncement.title}</h3>
                      <p className="text-white/80">
                        {getTypeLabel(selectedAnnouncement.type)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAnnouncement(null)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="space-y-6">
                  {/* Data do Evento */}
                  {selectedAnnouncement.event_date && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <Clock className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Data e Horário</p>
                        <p className="font-bold text-lg text-blue-900">
                          {formatEventDate(selectedAnnouncement.event_date)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Conteúdo */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Detalhes</h4>
                    <div className="prose max-w-none">
                      {selectedAnnouncement.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="text-gray-700 mb-4 leading-relaxed text-justify">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Contato WhatsApp */}
                  {selectedAnnouncement.whatsapp_contact && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Entre em Contato
                      </h4>
                      <p className="text-green-700 text-sm mb-3">
                        Para mais informações sobre este {selectedAnnouncement.type === 'event' ? 'evento' : 'aviso'}, 
                        entre em contato conosco:
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => handleWhatsAppClick(selectedAnnouncement.whatsapp_contact!)}
                        className="w-full flex items-center justify-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-100 border-green-300"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        WhatsApp: {selectedAnnouncement.whatsapp_contact}
                      </Button>
                    </div>
                  )}

                  {/* Informações Adicionais */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Publicado em:</strong> {new Date(selectedAnnouncement.created_at).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Botão de Fechar */}
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="primary"
                    onClick={() => setSelectedAnnouncement(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};