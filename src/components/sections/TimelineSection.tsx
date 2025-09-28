import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronDown, ChevronUp, X, ArrowLeft, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { OptimizedImage } from '../ui/OptimizedImage';
import { supabase } from '../../lib/supabase';

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  image_url?: string;
  cloudinary_public_id?: string;
  created_at: string;
}

interface TimelineSectionProps {
  onBack?: () => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ onBack }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setEvents(data);
      } else {
        // Eventos padrão da Catedral de São Miguel Arcanjo
        const defaultEvents: TimelineEvent[] = [
          {
            id: '1',
            year: 2024,
            title: 'Era Digital da Catedral',
            description: 'Implementação de tecnologias modernas para melhor atendimento à comunidade, incluindo transmissões online das missas e sistema digital de comunicação com os fiéis.',
            image_url: 'https://images.pexels.com/photos/6608313/pexels-photo-6608313.jpeg',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            year: 2000,
            title: 'Renovação do Milênio',
            description: 'Grande reforma e modernização da catedral para o novo milênio, incluindo restauração dos vitrais históricos e modernização do sistema de som.',
            image_url: 'https://images.pexels.com/photos/8468459/pexels-photo-8468459.jpeg',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            year: 1980,
            title: 'Expansão da Comunidade',
            description: 'Período de grande crescimento da comunidade paroquial, com a criação de novas pastorais e grupos de oração que fortaleceram a vida comunitária.',
            image_url: 'https://images.pexels.com/photos/7220900/pexels-photo-7220900.jpeg',
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            year: 1950,
            title: 'Reconstrução Pós-Guerra',
            description: 'Após os desafios da Segunda Guerra Mundial, a catedral passou por importantes reformas estruturais e espirituais, fortalecendo sua missão evangelizadora.',
            image_url: 'https://images.pexels.com/photos/8468456/pexels-photo-8468456.jpeg',
            created_at: new Date().toISOString()
          },
          {
            id: '5',
            year: 1900,
            title: 'Século XX - Modernização',
            description: 'Entrada no século XX com importantes melhorias na infraestrutura da catedral e expansão dos serviços pastorais para atender o crescimento urbano de São Miguel Paulista.',
            image_url: 'https://images.pexels.com/photos/6608314/pexels-photo-6608314.jpeg',
            created_at: new Date().toISOString()
          },
          {
            id: '6',
            year: 1850,
            title: 'Período Imperial',
            description: 'Durante o Império Brasileiro, a catedral consolidou-se como importante centro religioso da região, servindo não apenas São Miguel Paulista, mas comunidades vizinhas.',
            image_url: 'https://images.pexels.com/photos/8468502/pexels-photo-8468502.jpeg',
            created_at: new Date().toISOString()
          },
          {
            id: '7',
            year: 1750,
            title: 'Expansão Colonial',
            description: 'Período de grande expansão durante a era colonial, com a construção de novas dependências e o estabelecimento de tradições litúrgicas que perduram até hoje.',
            image_url: 'https://images.pexels.com/photos/8468461/pexels-photo-8468461.jpeg',
            created_at: new Date().toISOString()
          },
          {
            id: '8',
            year: 1622,
            title: 'Fundação da Catedral',
            description: 'Fundação da Catedral de São Miguel Arcanjo pelos primeiros colonizadores portugueses. Marco inicial de mais de 400 anos de fé, tradição e serviço à comunidade de São Miguel Paulista.',
            image_url: 'https://images.pexels.com/photos/14751274/pexels-photo-14751274.jpeg',
            created_at: new Date().toISOString()
          }
        ];
        setEvents(defaultEvents);
      }
    } catch (error) {
      console.error('Error fetching timeline events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (event: TimelineEvent) => {
    if (event.image_url) {
      setSelectedEvent(event);
    } else {
      setExpandedEvent(expandedEvent === event.id ? null : event.id);
    }
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <section id="timeline" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary-from)' }}></div>
            <p className="text-gray-600">Carregando linha do tempo...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header - apenas quando acessada como página individual */}
      {onBack && (
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
                  <h1 className="text-2xl sm:text-3xl font-bold">Linha do Tempo</h1>
                  <p className="text-sm sm:text-base truncate" style={{ color: 'var(--color-accent-2)' }}>
                    Mais de 400 anos de história e tradição
                  </p>
                </div>
              </div>
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0" style={{ color: 'var(--color-accent-2)' }} />
            </div>
          </div>
        </div>
      )}
      
      <section id="timeline" className={`${onBack ? 'py-20' : 'py-20'} bg-gradient-to-b from-white to-gray-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Título da seção - apenas na página inicial */}
          {!onBack && (
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
                Linha do Tempo
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-dark)' }}>
                Mais de 400 anos de história, fé e tradição
              </p>
            </motion.div>
          )}

          {events.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Linha do tempo em construção
              </h3>
              <p className="text-gray-500">
                Os marcos históricos da Catedral de São Miguel Arcanjo serão disponibilizados em breve
              </p>
            </Card>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 rounded-full" style={{ backgroundColor: 'var(--color-primary-from)', opacity: 0.3 }}></div>

              <div className="space-y-12">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Timeline Point */}
                    <div className="absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-white shadow-lg z-10" style={{ backgroundColor: 'var(--color-primary-from)' }}></div>

                    {/* Event Card */}
                    <div className="ml-20">
                      <button
                        onClick={() => handleEventClick(event)}
                        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl"
                        style={{ focusRingColor: 'var(--color-primary-from)' }}
                      >
                        <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                          <div className="p-6">
                            <div className="flex items-start gap-4">
                              {event.image_url && (
                                <div className="flex-shrink-0">
                                  <OptimizedImage
                                    src={event.image_url}
                                    alt={event.title}
                                    publicId={event.cloudinary_public_id}
                                    width={120}
                                    height={80}
                                    quality={25}
                                    ultraCompress={true}
                                    className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="px-3 py-1 text-sm font-bold text-white rounded-full" style={{ backgroundColor: 'var(--color-primary-from)' }}>
                                    {event.year}
                                  </span>
                                  <Clock className="h-4 w-4" style={{ color: 'var(--color-primary-from)' }} />
                                </div>
                                
                                <h3 className="text-xl font-bold mb-3 group-hover:opacity-80 transition-colors" style={{ color: 'var(--color-text-dark)' }}>
                                  {event.title}
                                </h3>
                                
                                <p className="leading-relaxed mb-4" style={{ color: 'var(--color-text-dark)' }}>
                                  {expandedEvent === event.id || event.description.length <= 200
                                    ? event.description
                                    : `${event.description.substring(0, 200)}...`
                                  }
                                </p>

                                {event.description.length > 200 && (
                                  <div className="flex items-center gap-2 font-medium group-hover:opacity-80 transition-colors text-sm" style={{ color: 'var(--color-primary-from)' }}>
                                    <span>
                                      {expandedEvent === event.id ? 'Ver menos' : 'Ver mais'}
                                    </span>
                                    {expandedEvent === event.id ? (
                                      <ChevronUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Todos os Marcos */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mt-16 text-center"
              >
                <Card className="p-8 border" style={{ backgroundColor: 'var(--color-accent-2)', opacity: 0.1, borderColor: 'var(--color-primary-from)' }}>
                  <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-primary-from)' }} />
                  <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary-from)' }}>
                    Mais de 400 Anos de História
                  </h3>
                  <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-dark)' }}>
                    Desde 1622, a Catedral de São Miguel Arcanjo tem sido um farol de fé e esperança 
                    para a comunidade de São Miguel Paulista. Cada marco em nossa linha do tempo 
                    representa momentos de crescimento, renovação e fortalecimento da nossa missão evangelizadora.
                  </p>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Modal de Imagem */}
      <AnimatePresence>
        {selectedEvent && selectedEvent.image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[95vh] bg-white rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline" 
                className="absolute top-4 right-4 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full w-10 h-10 p-0"
                onClick={handleCloseModal}
                style={{ color: 'var(--color-text-dark)', borderColor: 'var(--color-primary-from)' }}
              >
                <X className="h-5 w-5" />
              </Button>
              
              <div className="max-h-[95vh] overflow-y-auto">
                {selectedEvent.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <OptimizedImage
                      src={selectedEvent.image_url}
                      alt={selectedEvent.title}
                      publicId={selectedEvent.cloudinary_public_id}
                      width={800}
                      height={450}
                      quality={40}
                      className="w-full h-full object-cover"
                      priority={true}
                    />
                  </div>
                )}
                
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(to right, var(--color-primary-from), var(--color-primary-to))' }}>
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold" style={{ color: 'var(--color-primary-from)' }}>
                        {selectedEvent.year}
                      </h3>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-dark)' }}>
                    {selectedEvent.title}
                  </h1>
                  
                  <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-dark)' }}>
                    {selectedEvent.description}
                  </p>

                  <div className="text-center mt-8">
                    <Button
                      variant="primary"
                      onClick={handleCloseModal}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};