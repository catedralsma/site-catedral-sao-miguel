import React from 'react';
import { motion } from 'framer-motion';
import { Cross, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Parish } from '../../lib/supabase';
import { useTheme } from '../../lib/theme';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
  parish?: Parish | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, parish }) => {
  const { theme, isLoading: themeLoading } = useTheme();

  const handleWhatsAppClick = () => {
    const phone = parish?.whatsapp_number || parish?.phone?.replace(/\D/g, '');
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const message = encodeURIComponent('Olá! Gostaria de entrar em contato com a Catedral de São Miguel Arcanjo.');
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    } else {
      alert('Número do WhatsApp não configurado. Entre em contato pelo telefone: ' + (parish?.phone || '(11) 2032-4160'));
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14 sm:pt-16">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, var(--color-primary-from), var(--color-secondary-from), var(--color-background-dark))`
        }}
      ></div>
      
      {/* Overlay Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 sm:mb-8"
        >
          <Cross className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 sm:mb-6" style={{ color: 'var(--color-accent-2)' }} />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight" style={{ color: 'var(--color-text-light)' }}>
            {parish?.name || 'Catedral de São Miguel Arcanjo'}
          </h1>
          <p className="text-base sm:text-lg mb-6 sm:mb-8" style={{ color: 'var(--color-accent-1)' }}>
            {parish?.address?.split(',')[1]?.trim() || 'São Miguel Paulista, São Paulo'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border border-white/20"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-accent-2)' }}>
            {themeLoading ? 'Tradição e Fé' : theme.site_hero_title}
          </h2>
          <p className="text-base sm:text-lg leading-relaxed mb-6" style={{ color: 'var(--color-text-light)' }}>
            {themeLoading ? 'Uma catedral histórica no coração de São Miguel Paulista, sendo referência de fé e tradição para toda a região. Um lugar sagrado onde gerações encontram paz e esperança.' : theme.site_hero_description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              variant="secondary"
              size={window.innerWidth < 640 ? "md" : "lg"}
              onClick={handleWhatsAppClick}
              className="text-sm sm:text-base"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Fale Conosco (WhatsApp)
            </Button>
            <Button
              variant="secondary"
              size={window.innerWidth < 640 ? "md" : "lg"}
              onClick={handleWhatsAppClick}
              className="text-sm sm:text-base"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar Mensagem
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-white/70 px-4"
        >
          <p className="text-xs sm:text-sm text-center">
            "Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles".
          </p>
          <p className="text-xs mt-1 text-blue-200 text-center">- Mateus 18,20</p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 sm:h-3 bg-white/70 rounded-full mt-1 sm:mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};