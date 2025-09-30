import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';

// Layout Components
import { Header } from './components/layout/Header';
import { ScrollToTopButton } from './components/ui/ScrollToTopButton';
import { FloatingWhatsAppButton } from './components/ui/FloatingWhatsAppButton';

// Section Components
import { HomepageSlidesSection } from './components/sections/HomepageSlidesSection';
import { HeroSection } from './components/sections/HeroSection';
import { HistorySection } from './components/sections/HistorySection';
import { PriestSection } from './components/sections/PriestSection';
import { PhotoGallery } from './components/sections/PhotoGallery';
import { AlbumGallery } from './components/sections/AlbumGallery';
import { FullGallery } from './components/sections/FullGallery';
import { TimelineSection } from './components/sections/TimelineSection';
import { BlogSection } from './components/sections/BlogSection';
import { AnnouncementsSection } from './components/sections/AnnouncementsSection';
import { ContactSection } from './components/sections/ContactSection';
import { PastoralsPage } from './components/sections/PastoralsPage';
import { CelebrationsPage } from './components/sections/CelebrationsPage';

// Pages
import { CapelaPage } from './pages/CapelaPage';
import { CapelaDonatePage } from './pages/CapelaDonatePage';
import { DonationSuccessPage } from './pages/DonationSuccessPage';
import { DonationErrorPage } from './pages/DonationErrorPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfUsePage } from './pages/TermsOfUsePage';

// Admin Components
import { AdminPanel } from './components/admin/AdminPanel';
import { LoginForm } from './components/admin/LoginForm';

// UI Components
import { UrgentPopup } from './components/ui/UrgentPopup';
import { Button } from './components/ui/Button';

// Utils
import { supabase } from './lib/supabase';
import { getThemeSettings, applyThemeToDocument } from './lib/theme';

type CurrentView =
  | 'home'
  | 'history'
  | 'priests'
  | 'photos'
  | 'albums'
  | 'full-gallery'
  | 'timeline'
  | 'blog'
  | 'announcements'
  | 'contact'
  | 'pastorals'
  | 'celebrations'
  | 'capela-donate'
  | 'donation-success'
  | 'donation-error'
  | 'privacy-policy'
  | 'terms-of-use';

function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [parish, setParish] = useState<any>(null);
  const [donationSessionId, setDonationSessionId] = useState<string | null>(null);

  // Função para mapear URL para view
  const getViewFromPath = (pathname: string): CurrentView => {
    const routeMap: Record<string, CurrentView> = {
      '/': 'home',
      '/home': 'home',
      '/inicio': 'home',
      '/blog': 'blog',
      '/mensagem': 'blog',
      '/mensagem-de-fe': 'blog',
      '/doacao': 'capela-donate',
      '/doacoes': 'capela-donate',
      '/capela-doacao': 'capela-donate',
      '/donate': 'capela-donate',
      '/donation': 'capela-donate',
      '/historia': 'history',
      '/history': 'history',
      '/nossa-historia': 'history',
      '/contato': 'contact',
      '/contact': 'contact',
      '/fale-conosco': 'contact',
      '/pastorais': 'pastorals',
      '/pastorals': 'pastorals',
      '/grupos': 'pastorals',
      '/celebracoes': 'celebrations',
      '/celebrations': 'celebrations',
      '/missas': 'celebrations',
      '/horarios': 'celebrations',
      '/fotos': 'photos',
      '/photos': 'photos',
      '/galeria': 'photos',
      '/gallery': 'photos',
      '/albuns': 'albums',
      '/albums': 'albums',
      '/galeria-completa': 'full-gallery',
      '/full-gallery': 'full-gallery',
      '/linha-do-tempo': 'timeline',
      '/timeline': 'timeline',
      '/historia-completa': 'timeline',
      '/capela': 'capela',
      '/chapel': 'capela',
      '/sao-miguel': 'capela',
      '/clero': 'priests',
      '/priests': 'priests',
      '/padres': 'priests',
      '/eventos': 'announcements',
      '/events': 'announcements',
      '/avisos': 'announcements',
      '/announcements': 'announcements',
      '/politica-de-privacidade': 'privacy-policy',
      '/privacy-policy': 'privacy-policy',
      '/termos-de-uso': 'terms-of-use',
      '/terms-of-use': 'terms-of-use'
    };

    return routeMap[pathname] || 'home';
  };

  // Função para atualizar a URL
  const updateURL = (view: CurrentView) => {
    const urlMap: Record<CurrentView, string> = {
      'home': '/',
      'blog': '/blog',
      'capela-donate': '/doacao',
      'donation-success': '/doacao-sucesso',
      'donation-error': '/doacao-erro',
      'history': '/historia',
      'contact': '/contato',
      'pastorals': '/pastorais',
      'celebrations': '/celebracoes',
      'photos': '/fotos',
      'albums': '/albuns',
      'full-gallery': '/galeria-completa',
      'timeline': '/linha-do-tempo',
      'capela': '/capela',
      'priests': '/clero',
      'announcements': '/eventos',
      'privacy-policy': '/politica-de-privacidade',
      'terms-of-use': '/termos-de-uso'
    };

    const url = urlMap[view] || '/';
    window.history.pushState(null, '', url);
  };

  // Hooks devem ser declarados no topo, antes do return e de qualquer lógica condicional de renderização
  useEffect(() => {
    // Inicializar view baseada na URL atual
    const initialView = getViewFromPath(window.location.pathname);
    setCurrentView(initialView);

    // Load parish data for header logo
    const loadParishData = async () => {
      try {
        const { data, error } = await supabase
          .from('parishes')
          .select('*')
          .limit(1)
          .single();

        if (data) {
          setParish(data);
        }
      } catch (error) {
        console.error('Error loading parish data:', error);
      }
    };

    // Load theme settings
    const loadTheme = async () => {
      try {
        const themeSettings = await getThemeSettings();
        applyThemeToDocument(themeSettings);
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    // Check authentication
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Call the functions
    loadParishData();
    loadTheme();
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array means it runs once on mount

  // Escutar mudanças na URL (botão voltar/avançar do navegador)
  useEffect(() => {
    const handlePopState = () => {
      const newView = getViewFromPath(window.location.pathname);
      setCurrentView(newView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // NOVO useEffect para lidar com a URL de administração
  useEffect(() => {
    const checkAdminAccess = () => {
      const hash = window.location.hash;
      if (hash === '#admin' || hash === '#painel' || hash === '#administracao') {
        if (isAuthenticated) {
          setShowAdmin(true);
        } else {
          setShowLogin(true);
        }
        // Limpar o hash da URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    
    checkAdminAccess();
    
    // Escutar mudanças no hash
    window.addEventListener('hashchange', checkAdminAccess);
    return () => window.removeEventListener('hashchange', checkAdminAccess);
  }, [isAuthenticated]); // Executa novamente quando o estado de autenticação muda

  // NOVO useEffect para lidar com parâmetros de doação
  useEffect(() => {
    const checkDonationStatus = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const donationStatus = urlParams.get('donation');
      const sessionId = urlParams.get('session_id');
      
      if (donationStatus === 'success' && sessionId) {
        setDonationSessionId(sessionId);
        setCurrentView('donation-success');
        
        // Limpar os parâmetros da URL mantendo o hash se existir
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState(null, '', newUrl);
      } else if (donationStatus === 'cancelled' || donationStatus === 'error') {
        setCurrentView('donation-error');
        
        // Limpar os parâmetros da URL mantendo o hash se existir
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState(null, '', newUrl);
      }
    };
    
    // Verificar na inicialização
    checkDonationStatus();
    
    // Escutar mudanças na URL (popstate)
    window.addEventListener('popstate', checkDonationStatus);
    return () => window.removeEventListener('popstate', checkDonationStatus);
  }, []); // Executa apenas uma vez na inicialização
  const handleNavigate = (section: string) => {
    setCurrentView(section as CurrentView);
    updateURL(section as CurrentView);
    
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateWithId = (section: string, id?: string) => {
    if (id) {
      // Handle navigation to specific content
      switch (section) {
        case 'blog':
          setCurrentView('blog');
          updateURL('blog');
          // You could add logic here to scroll to specific post or open it
          break;
        case 'announcements':
          setCurrentView('announcements');
          updateURL('announcements');
          // You could add logic here to scroll to specific announcement
          break;
        case 'celebrations':
          setCurrentView('celebrations');
          updateURL('celebrations');
          // You could add logic here to scroll to specific celebration
          break;
        default:
          setCurrentView(section as CurrentView);
          updateURL(section as CurrentView);
      }
    } else {
      setCurrentView(section as CurrentView);
      updateURL(section as CurrentView);
    }
    
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setShowAdmin(true);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogin = () => {
    setShowLogin(false);
    setIsAuthenticated(true);
    setShowAdmin(true);
  };

  const handleAdminClose = () => {
    setShowAdmin(false);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <HomepageSlidesSection onNavigate={handleNavigateWithId} />
            <HeroSection onNavigate={handleNavigate} />
            <PriestSection />
            <CelebrationsPage onBack={() => setCurrentView('home')} isHomePage={true} />
            <AnnouncementsSection />
            <HistorySection />
            <PhotoGallery onNavigateToFullGallery={() => setCurrentView('albums')} />
            <TimelineSection />
            <BlogSection />
            <ContactSection onNavigate={handleNavigate} />
          </>
        );
      case 'history':
        return <HistorySection onBack={() => setCurrentView('home')} />;
      case 'capela':
        return <CapelaPage onBack={() => setCurrentView('home')} onNavigateToDonation={() => setCurrentView('capela-donate')} />;
      case 'capela-donate':
        return <CapelaDonatePage onBack={() => setCurrentView('capela')} />;
      case 'donation-success':
        return <DonationSuccessPage onBack={() => setCurrentView('capela')} sessionId={donationSessionId} />;
      case 'donation-error':
        return <DonationErrorPage onBack={() => setCurrentView('capela')} />;
      case 'priests':
        return <PriestSection />;
      case 'photos':
        return <FullGallery onBack={() => setCurrentView('home')} />;
      case 'albums':
        return <AlbumGallery onBack={() => setCurrentView('home')} />;
      case 'full-gallery':
        return <FullGallery onBack={() => setCurrentView('home')} />;
      case 'timeline':
        return <TimelineSection />;
      case 'blog':
        return <BlogSection onNavigateHome={() => setCurrentView('home')} />;
      case 'announcements':
        return <AnnouncementsSection />;
      case 'contact':
        return <ContactSection onNavigate={handleNavigate} isFullPage={true} />;
      case 'pastorals':
        return <PastoralsPage onBack={() => setCurrentView('home')} />;
      case 'celebrations':
        return <CelebrationsPage onBack={() => setCurrentView('home')} />;
      case 'privacy-policy':
        return <PrivacyPolicyPage onBack={() => setCurrentView('home')} />;
      case 'terms-of-use':
        return <TermsOfUsePage onBack={() => setCurrentView('home')} />;
      default:
        return (
          <>
            <HomepageSlidesSection onNavigate={handleNavigateWithId} />
            <HeroSection onNavigate={handleNavigate} />
            <PriestSection />
            <CelebrationsPage onBack={() => setCurrentView('home')} />
            <AnnouncementsSection />
            <HistorySection />
            <PhotoGallery onNavigateToFullGallery={() => setCurrentView('albums')} />
            <TimelineSection />
            <BlogSection />
            <ContactSection onNavigate={handleNavigate} />
          </>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* Header - only show on home view */}
      {currentView === 'home' && <Header onNavigate={handleNavigate} parish={parish} />}

      {/* Main Content */}
      <main className="relative">
        {renderCurrentView()}
      </main>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsAppButton whatsappNumber={parish?.whatsapp_number || parish?.phone} />

      {/* Urgent Popup */}
      <UrgentPopup />

      {/* Admin Panel */}
      <AnimatePresence>
        {showAdmin && <AdminPanel onClose={handleAdminClose} />}
      </AnimatePresence>

      {/* Login Form */}
      <AnimatePresence>
        {showLogin && <LoginForm onLogin={handleLogin} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
