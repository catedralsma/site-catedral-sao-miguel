import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { OptimizedImage } from '../ui/OptimizedImage';
import { supabase, Slide } from '../../lib/supabase';

interface HomepageSlidesSectionProps {
  onNavigate: (section: string, id?: string) => void;
}

export const HomepageSlidesSection: React.FC<HomepageSlidesSectionProps> = ({ onNavigate }) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length]);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const preloadImage = (index: number) => {
    if (slides[index]?.image_url) {
      const img = new Image();
      img.src = slides[index].image_url;
    }
  };

  const nextSlide = () => {
    const index = (currentSlide + 1) % slides.length;
    setCurrentSlide(index);
    preloadImage(index);
  };

  const prevSlide = () => {
    const index = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    setCurrentSlide(index);
    preloadImage(index);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    preloadImage(index);
  };

  const handleButtonClick = (slide: Slide) => {
    if (!slide.link_url && !slide.related_content_id) return;

    // Handle custom and internal page links
    if ((slide.content_type === 'custom' || slide.content_type === 'internal_page') && slide.link_url) {
      if (slide.link_url.startsWith('http')) {
        // External link
        window.open(slide.link_url, '_blank', 'noopener,noreferrer');
      } else {
        // Internal route
        const route = slide.link_url.startsWith('/') ? slide.link_url.substring(1) : slide.link_url;
        onNavigate(route);
      }
      return;
    }

    // Handle related content navigation
    if (slide.related_content_id) {
      switch (slide.content_type) {
        case 'blog_post':
          onNavigate('blog', slide.related_content_id);
          break;
        case 'announcement':
          onNavigate('announcements', slide.related_content_id);
          break;
        case 'event':
          onNavigate('celebrations', slide.related_content_id);
          break;
      }
    }
  };

  if (isLoading) {
    return (
      <section className="relative w-full min-h-[calc(100vh-64px)] max-h-[70vh] flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, var(--color-primary-from), var(--color-primary-to))'
      }}>
        <div className="text-center text-white px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Carregando slides...</p>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative w-full min-h-[calc(100vh-64px)] max-h-[70vh] flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, var(--color-primary-from), var(--color-primary-to))'
      }}>
        <div className="text-center text-white max-w-2xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bem-vindos à Nossa Paróquia
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Um lugar de fé, esperança e comunidade
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden" style={{ 
      width: '100vw',
      maxWidth: '100vw',
      height: '70vh'
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          {/* Background Image Container */}
          <div
            className="absolute inset-0 w-full h-full"
          >
            {slides[currentSlide].image_url && (
              <img
                src={slides[currentSlide].image_url}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            )}
            {!slides[currentSlide].image_url && (
              <div 
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-from), var(--color-primary-to))'
                }}
              />
            )}
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30" />
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white max-w-4xl mx-auto">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight drop-shadow-lg px-4 max-w-4xl mx-auto w-full max-w-full word-wrap break-words"
              >
                {slides[currentSlide].title}
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-100 leading-relaxed drop-shadow-lg px-4 max-w-3xl mx-auto w-full max-w-full word-wrap break-words"
              >
                {slides[currentSlide].description}
              </motion.p>

              {/* Action Button */}
              {(slides[currentSlide].link_text || slides[currentSlide].link_url || slides[currentSlide].related_content_id) && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mt-6 sm:mt-8"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => handleButtonClick(slides[currentSlide])}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <span>{slides[currentSlide].link_text || 'Saiba Mais'}</span>
                    {slides[currentSlide].content_type === 'custom' && slides[currentSlide].link_url?.startsWith('http') ? (
                      <ExternalLink className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-none"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-none"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white scale-110'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>

          {/* Auto-play Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white border-none"
          >
            {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </>
      )}
    </section>
  );
};
