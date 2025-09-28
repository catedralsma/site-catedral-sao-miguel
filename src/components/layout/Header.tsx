import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Church } from 'lucide-react';
import { Parish } from '../../lib/supabase';

interface HeaderProps {
  onNavigate: (section: string) => void;
  parish?: Parish | null;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, parish }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Início' },
    { id: 'history', label: 'História' },
    { id: 'capela', label: 'Capela São Miguel' },
    { id: 'pastorals', label: 'Pastorais' },
    { id: 'celebrations', label: 'Celebrações' },
    { id: 'blog', label: 'Blog' },
    { id: 'photos', label: 'Fotos' },
    { id: 'contact', label: 'Contato' }
  ];

  const handleNavigate = (section: string) => {
    onNavigate(section);
    setIsMenuOpen(false);
  };

  // Função específica para Android com preventDefault e stopPropagation
  const handleMobileNavigate = (e: React.MouseEvent, section: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Força o fechamento do menu primeiro
    setIsMenuOpen(false);
    
    // Pequeno delay para garantir que o menu feche antes da navegação
    setTimeout(() => {
      onNavigate(section);
    }, 100);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg safe-area-inset-top will-change-transform w-full max-w-full overflow-hidden" style={{
      background: 'linear-gradient(to right, var(--color-primary-from), var(--color-primary-to))',
      color: 'var(--color-header-text)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-16 w-full">
          <motion.div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={() => handleNavigate('home')}
            whileHover={{ scale: 1.05 }}
          >
            {parish?.logo_url_light ? (
              <img
                src={parish.logo_url_light}
                alt="Logo da Catedral"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-md"
              />
            ) : parish?.logo_url ? (
              <img
                src={parish.logo_url}
                alt="Logo da Catedral"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-md"
              />
            ) : (
              <Church className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: 'var(--color-accent-2)' }} />
            )}
            <div className="hidden sm:block">
              <h1 className="font-bold text-sm sm:text-lg" style={{ 
                color: 'var(--color-header-text)',
                fontFamily: 'var(--site-header-font-family)'
              }}>Catedral São Miguel Arcanjo</h1>
              <p className="text-sm" style={{ 
                color: 'var(--color-accent-2)',
                fontFamily: 'var(--site-header-font-family)'
              }}>São Miguel Paulista</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="font-bold text-sm" style={{ 
                color: 'var(--color-header-text)',
                fontFamily: 'var(--site-header-font-family)',
              }}>Catedral de São Miguel Arcanjo</h1>
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="font-medium transition-colors duration-200 text-sm xl:text-base"
                style={{ 
                  color: 'var(--color-header-text)',
                  '--hover-color': 'var(--color-accent-2)'
                }}
                whileHover={{ y: -2 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -mr-2 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              color: 'var(--color-header-text)',
              touchAction: 'manipulation',
            }}
          >
            {isMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden py-4 border-t backdrop-blur-md w-full max-w-full overflow-hidden"
              style={{
                background: 'var(--color-primary-to)',
                borderTopColor: 'var(--color-accent-2)'
              }}
            >
              {menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="mx-2 w-auto max-w-full"
                  whileHover={{ x: 10 }}
                >
                  <button
                    onClick={(e) => handleMobileNavigate(e, item.id)}
                    className="block w-full text-left px-4 py-3 font-medium transition-colors duration-200 rounded-lg max-w-full overflow-hidden"
                    style={{
                      color: 'var(--color-header-text)',
                      minHeight: '48px',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-from)';
                      e.currentTarget.style.color = 'var(--color-accent-2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-header-text)';
                    }}
                  >
                    {item.label}
                  </button>
                </motion.div>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};