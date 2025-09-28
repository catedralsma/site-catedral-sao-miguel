import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Church, Clock, User, Calendar, Heart, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, Celebration } from '../../lib/supabase';

interface CelebrationsPageProps {
  onBack: () => void;
  isHomePage?: boolean;
}

export const CelebrationsPage: React.FC<CelebrationsPageProps> = ({ onBack, isHomePage = false }) => {
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [selectedCelebration, setSelectedCelebration] = useState<Celebration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const daysOfWeek = [
    { id: 'sunday', label: 'Domingo', shortLabel: 'Dom' },
    { id: 'monday', label: 'Segunda-feira', shortLabel: 'Seg' },
    { id: 'tuesday', label: 'Terça-feira', shortLabel: 'Ter' },
    { id: 'wednesday', label: 'Quarta-feira', shortLabel: 'Qua' },
    { id: 'thursday', label: 'Quinta-feira', shortLabel: 'Qui' },
    { id: 'friday', label: 'Sexta-feira', shortLabel: 'Sex' },
    { id: 'saturday', label: 'Sábado', shortLabel: 'Sáb' }
  ];

  useEffect(() => {
    fetchCelebrations();
  }, []);

  const fetchCelebrations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('celebrations')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setCelebrations(data);
      } else {
        // Celebrações padrão se não houver dados
        const defaultCelebrations: Celebration[] = [
          {
            id: '1',
            community_name: 'Catedral de São Miguel Arcanjo',
            celebrant_name: 'Pe. João Silva',
            celebration_type: 'Missa',
            time: '08:00',
            day_of_week: 'sunday',
            is_active: true,
            order_index: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            community_name: 'Catedral de São Miguel Arcanjo',
            celebrant_name: 'Pe. Carlos Mendes',
            celebration_type: 'Missa',
            time: '10:00',
            day_of_week: 'sunday',
            is_active: true,
            order_index: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            community_name: 'Catedral de São Miguel Arcanjo',
            celebrant_name: 'Pe. João Silva',
            celebration_type: 'Missa',
            time: '19:00',
            day_of_week: 'sunday',
            is_active: true,
            order_index: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            community_name: 'Catedral de São Miguel Arcanjo',
            celebrant_name: 'Pe. Carlos Mendes',
            celebration_type: 'Missa',
            time: '19:30',
            day_of_week: 'wednesday',
            is_active: true,
            order_index: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '5',
            community_name: 'Catedral de São Miguel Arcanjo',
            celebrant_name: 'Pe. João Silva',
            celebration_type: 'Missa',
            time: '19:30',
            day_of_week: 'friday',
            is_active: true,
            order_index: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '6',
            community_name: 'Catedral de São Miguel Arcanjo',
            celebrant_name: 'Pe. Carlos Mendes',
            celebration_type: 'Missa',
            time: '19:00',
            day_of_week: 'saturday',
            is_active: true,
            order_index: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setCelebrations(defaultCelebrations);
      }
    } catch (error) {
      console.error('Error fetching celebrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayLabel = (dayId: string) => {
    return daysOfWeek.find(d => d.id === dayId)?.label || dayId;
  };

  const groupCelebrationsByDay = () => {
    const grouped: { [key: string]: Celebration[] } = {};
    
    celebrations.forEach(celebration => {
      if (!grouped[celebration.day_of_week]) {
        grouped[celebration.day_of_week] = [];
      }
      grouped[celebration.day_of_week].push(celebration);
    });

    return grouped;
  };

  const groupedCelebrations = groupCelebrationsByDay();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary-from)' }}></div>
          <p className="text-gray-600">Carregando celebrações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header - apenas quando não é página inicial */}
      {!isHomePage && (
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
                  <h1 className="text-2xl sm:text-3xl font-bold">Escala de Celebrações</h1>
                  <p className="text-sm sm:text-base truncate" style={{ color: 'var(--color-accent-2)' }}>
                    Horários das missas e celebrações da catedral
                  </p>
                </div>
              </div>
              <Church className="h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0" style={{ color: 'var(--color-accent-2)' }} />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título da seção - apenas na página inicial */}
        {isHomePage && (
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
              Horários de Celebrações
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-dark)' }}>
              Confira os horários das missas e celebrações da nossa catedral
            </p>
          </motion.div>
        )}

        {celebrations.length === 0 ? (
          <Card className="p-12 text-center">
            <Church className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma celebração cadastrada
            </h3>
            <p className="text-gray-500">
              Use o painel administrativo para adicionar as celebrações da catedral
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {daysOfWeek.map(day => {
              const dayCelebrations = groupedCelebrations[day.id];
              if (!dayCelebrations || dayCelebrations.length === 0) return null;

              return (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="overflow-hidden">
                    {/* Day Header */}
                    <div className="text-white p-4 sm:p-6" style={{ background: 'linear-gradient(to right, var(--color-primary-from), var(--color-primary-to))' }}>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6" style={{ color: 'var(--color-accent-2)' }} />
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold">{day.label}</h3>
                          <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
                            {dayCelebrations.length} celebração{dayCelebrations.length !== 1 ? 'ões' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Celebrations List */}
                    <div className="p-4 sm:p-6">
                      <div className="space-y-4">
                        {dayCelebrations.map((celebration, index) => (
                          <motion.div
                            key={celebration.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                          >
                            <button
                              onClick={() => setSelectedCelebration(celebration)}
                              className="w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                              style={{ focusRingColor: 'var(--color-primary-from)' }}
                            >
                              <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 group">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-2)', opacity: 0.2 }}>
                                    <Clock className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-lg font-semibold text-gray-800 group-hover:text-blue-800 transition-colors">
                                      {celebration.time}
                                    </h4>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                      celebration.celebration_type === 'Missa'
                                        ? 'text-white'
                                        : 'bg-green-100 text-green-800'
                                    }`} style={celebration.celebration_type === 'Missa' ? {
                                      backgroundColor: 'var(--color-primary-from)'
                                    } : {}}>
                                      {celebration.celebration_type}
                                    </span>
                                  </div>
                                  
                                  <p className="text-gray-600 text-sm mb-1">
                                    <strong>Local:</strong> {celebration.community_name}
                                  </p>
                                  
                                  <p className="text-gray-600 text-sm">
                                    <strong>Celebrante:</strong> {celebration.celebrant_name}
                                  </p>
                                </div>

                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary-from)' }}></div>
                                </div>
                              </div>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Informações Gerais */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <Card className="p-6 border" style={{ backgroundColor: 'var(--color-accent-2)', opacity: 0.1, borderColor: 'var(--color-primary-from)' }}>
            <div className="text-center">
              <Heart className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--color-primary-from)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-primary-from)' }}>
                Venha Celebrar Conosco!
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Todas as celebrações são abertas à comunidade. 
                Venha participar e fortalecer sua fé junto com nossa família catedralicia.
                Para informações sobre sacramentos, entre em contato conosco.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedCelebration && (
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
                    <Church className="h-6 w-6" />
                    <div>
                      <h3 className="text-xl font-bold">{selectedCelebration.celebration_type}</h3>
                      <p style={{ color: 'var(--color-accent-2)' }}>
                        {getDayLabel(selectedCelebration.day_of_week)} às {selectedCelebration.time}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCelebration(null)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="space-y-6">
                  {/* Informações da Celebração */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Clock className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
                      <div>
                        <p className="text-sm text-gray-600">Horário</p>
                        <p className="font-semibold text-gray-800">{selectedCelebration.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
                      <div>
                        <p className="text-sm text-gray-600">Celebrante</p>
                        <p className="font-semibold text-gray-800">{selectedCelebration.celebrant_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Local */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Church className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
                      <h4 className="text-lg font-semibold text-gray-800">Local da Celebração</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedCelebration.community_name}
                    </p>
                  </div>

                  {/* Informações Adicionais (CORRIGIDO) */}
                  <div className="border rounded-lg p-4 bg-gray-100" style={{ borderColor: 'var(--color-primary-from)' }}>
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-black">
                      <Heart className="h-5 w-5" style={{ color: 'var(--color-primary-from)' }} />
                      Informações Importantes
                    </h4>
                    <div className="space-y-2 text-sm text-black">
                      <p>• Chegue com 15 minutos de antecedência</p>
                      <p>• Confissões disponíveis 30 minutos antes da missa</p>
                      <p>• Estacionamento disponível na praça</p>
                      <p>• Celebração aberta a toda a comunidade</p>
                    </div>
                  </div>
                </div>

                {/* Botão de Fechar */}
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="primary"
                    onClick={() => setSelectedCelebration(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};