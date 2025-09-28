import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Church, X, Heart, BookOpen } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { OptimizedImage } from '../ui/OptimizedImage';
import { supabase, Priest } from '../../lib/supabase';

export const PriestSection: React.FC = () => {
  const [priests, setPriests] = useState<Priest[]>([]);
  const [selectedPriest, setSelectedPriest] = useState<Priest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('priests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setPriests(data);
      } else {
        // Dados padrão se não houver registros
        const defaultPriests: Priest[] = [
          {
            id: '1',
            name: 'Pe. João Silva',
            title: 'Pároco',
            photo_url: 'https://images.pexels.com/photos/8468502/pexels-photo-8468502.jpeg',
            cloudinary_public_id: null,
            short_bio: 'Pároco dedicado há mais de 15 anos, Pe. João tem sido um pilar fundamental na condução espiritual da nossa comunidade, sempre presente nos momentos de alegria e dificuldade.',
            full_bio: 'Pe. João Silva nasceu em São Paulo em 1975 e foi ordenado sacerdote em 2005. Chegou à nossa paróquia em 2010 e desde então tem se dedicado incansavelmente ao cuidado pastoral da comunidade.\n\nFormado em Teologia pela PUC-SP, Pe. João também possui especialização em Liturgia e Pastoral Familiar. Sua paixão pela evangelização e seu carisma especial com os jovens fizeram dele uma figura querida por toda a comunidade.\n\nAlém das atividades paroquiais, Pe. João coordena grupos de oração, retiros espirituais e é conhecido por suas homilias inspiradoras que tocam o coração dos fiéis. Sua porta está sempre aberta para acolher quem precisa de orientação espiritual.',
            ordination_year: 2005,
            parish_since: 2010,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Pe. Carlos Mendes',
            title: 'Vigário Paroquial',
            photo_url: 'https://images.pexels.com/photos/8468456/pexels-photo-8468456.jpeg',
            cloudinary_public_id: null,
            short_bio: 'Vigário jovem e entusiasta, Pe. Carlos trouxe nova energia para nossa paróquia com seu trabalho especial junto aos jovens e famílias.',
            full_bio: 'Pe. Carlos Mendes, ordenado em 2015, chegou à nossa paróquia em 2020 como Vigário Paroquial. Sua juventude e energia contagiante rapidamente conquistaram o coração da comunidade.\n\nFormado em Filosofia e Teologia, Pe. Carlos tem uma paixão especial pelo trabalho com jovens e pela música litúrgica. Ele coordena o grupo de jovens da paróquia e o coral, trazendo uma nova dinâmica às celebrações.\n\nSua abordagem moderna e acessível da evangelização, combinada com profundo respeito pela tradição, faz dele um pastor querido por fiéis de todas as idades.',
            ordination_year: 2015,
            parish_since: 2020,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setPriests(defaultPriests);
      }
    } catch (error) {
      console.error('Error fetching priests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriestClick = (priest: Priest) => {
    setSelectedPriest(priest);
  };

  const handleCloseModal = () => {
    setSelectedPriest(null);
  };

  if (isLoading) {
    return (
      <section id="priests" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando informações do clero...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="priests" className="py-20 bg-white">
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
              Nosso Clero
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-dark)' }}>
              Conheça os pastores que dedicam suas vidas ao cuidado espiritual da nossa comunidade
            </p>
          </motion.div>

          {priests.length === 0 ? (
            <Card className="p-12 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Informações em atualização
              </h3>
              <p className="text-gray-500">
                As informações sobre o clero serão disponibilizadas em breve
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-6">
              {priests.map((priest, index) => (
                <motion.div
                  key={priest.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <button
                    onClick={() => handlePriestClick(priest)}
                    className="w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-xl"
                  >
                    <Card className="group h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                      {/* Photo */}
                      <div className="aspect-square overflow-hidden bg-gray-100 relative">
                        {priest.photo_url ? (
                          <OptimizedImage
                            src={priest.photo_url}
                            alt={priest.name}
                            publicId={priest.cloudinary_public_id || undefined}
                            width={120}
                            height={120}
                            quality={35}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Content */}
                      <div className="p-2 flex-1 flex flex-col">
                        <div className="text-center mb-2">
                          <h3 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-blue-800 transition-colors mb-1">
                            {priest.name}
                          </h3>
                          <p className="font-semibold text-[10px] sm:text-xs mb-1" style={{ color: 'var(--color-primary-from)' }}>
                            {priest.title}
                          </p>
                        </div>

                        <p className="text-gray-600 text-[10px] sm:text-xs leading-relaxed mb-2 flex-1 line-clamp-2 text-center">
                          {priest.short_bio}
                        </p>

                        {/* Info Cards */}
                        <div className="space-y-0.5 mb-1">
                          {priest.ordination_year && (
                            <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] text-gray-500">
                              <Church className="h-2.5 w-2.5" />
                              <span>Ordenado em {priest.ordination_year}</span>
                            </div>
                          )}
                          {priest.parish_since && (
                            <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] text-gray-500">
                              <Calendar className="h-2.5 w-2.5" />
                              <span>Na paróquia desde {priest.parish_since}</span>
                          </div>
                          )}
                        </div>

                        <div className="text-center">
                          <span className="inline-flex items-center font-medium group-hover:opacity-80 transition-colors text-[10px] sm:text-xs" style={{ color: 'var(--color-primary-from)' }}>
                            <span>Conhecer melhor</span>
                            <BookOpen className="h-2.5 w-2.5 ml-1 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedPriest && (
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
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="text-white p-6" style={{ background: 'linear-gradient(to right, var(--color-primary-from), var(--color-primary-to))' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {selectedPriest.photo_url && (
                      <img
                        src={selectedPriest.photo_url}
                        alt={selectedPriest.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                      />
                    )}
                    <div>
                      <h3 className="text-2xl font-bold">{selectedPriest.name}</h3>
                      <p style={{ color: 'var(--color-accent-2)' }}>{selectedPriest.title}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Foto grande */}
                  {selectedPriest.photo_url && (
                    <div className="md:col-span-1">
                      <img
                        src={selectedPriest.photo_url}
                        alt={selectedPriest.name}
                        className="w-full aspect-square object-cover rounded-xl shadow-lg"
                      />
                    </div>
                  )}

                  {/* Informações */}
                  <div className={selectedPriest.photo_url ? "md:col-span-2" : "md:col-span-3"}>
                    {/* Cards de informação */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      {selectedPriest.ordination_year && (
                        <div className="rounded-lg p-4 bg-gray-100 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Church className="h-5 w-5 text-blue-800" />
                            <span className="text-sm font-bold text-gray-800">Ordenação</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{selectedPriest.ordination_year}</p>
                          <p className="text-xs text-gray-700 font-medium">
                            {new Date().getFullYear() - selectedPriest.ordination_year} anos de sacerdócio
                          </p>
                        </div>
                      )}

                      {selectedPriest.parish_since && (
                        <div className="rounded-lg p-4 bg-gray-100 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-5 w-5 text-green-800" />
                            <span className="text-sm font-bold text-gray-800">Na Catedral</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">Desde {selectedPriest.parish_since}</p>
                          <p className="text-xs text-gray-700 font-medium">
                            {new Date().getFullYear() - selectedPriest.parish_since} anos conosco
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Biografia completa */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-red-800" />
                        Biografia
                      </h4>
                      <div className="prose max-w-none">
                        {selectedPriest.full_bio.split('\n').map((paragraph, index) => (
                          <p key={index} className="text-gray-700 mb-4 leading-relaxed text-justify">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                  </div>
                </div>
              </div>

                {/* Botão de Fechar */}
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="primary"
                    onClick={handleCloseModal}
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