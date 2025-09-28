import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, XCircle, Heart, RefreshCw, MessageCircle, Mail, AlertTriangle, Church, CreditCard, Smartphone } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

interface DonationErrorPageProps {
  onBack: () => void;
}

export const DonationErrorPage: React.FC<DonationErrorPageProps> = ({ onBack }) => {
  const [contactInfo, setContactInfo] = useState({
    phone: '(11) 2032-4160',
    whatsapp: '11999999999',
    email: 'doacoes@catedralsaomiguel.com.br'
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['capela_phone', 'capela_whatsapp', 'capela_email']);

      if (data) {
        const settings = data.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as any);

        setContactInfo({
          phone: settings.capela_phone || '(11) 2032-4160',
          whatsapp: settings.capela_whatsapp || '11999999999',
          email: settings.capela_email || 'doacoes@catedralsaomiguel.com.br'
        });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Tive um problema ao tentar fazer uma doação para a Capela São Miguel. Podem me ajudar?');
    window.open(`https://wa.me/55${contactInfo.whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent('Problema com Doação - Capela São Miguel');
    const body = encodeURIComponent('Olá,\n\nTive um problema ao tentar fazer uma doação para a Capela São Miguel. Podem me ajudar?\n\nObrigado!');
    window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleTryAgain = () => {
    // Navegar de volta para a página de doação
    window.history.pushState(null, '', '/capela-donate');
    window.location.reload();
  };

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
                <span className="hidden sm:inline">Voltar à Capela</span>
                <span className="sm:hidden">Voltar</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">Doação Não Concluída</h1>
                <p className="text-sm sm:text-base truncate" style={{ color: 'var(--color-accent-2)' }}>
                  Não se preocupe, você pode tentar novamente
                </p>
              </div>
            </div>
            <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0" style={{ color: 'var(--color-accent-2)' }} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-yellow-100"
            >
              <XCircle className="h-16 w-16 text-yellow-600" />
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-3xl sm:text-4xl font-bold mb-4 text-yellow-800"
          >
            Doação Não Concluída
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed"
          >
            Sua doação foi cancelada ou não pôde ser processada. Não se preocupe, 
            nenhum valor foi cobrado e você pode tentar novamente quando desejar.
          </motion.p>
        </motion.div>

        {/* Possible Reasons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-12"
        >
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3" style={{ color: 'var(--color-text-dark)' }}>
              <AlertTriangle className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
              Possíveis Motivos
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Cancelamento Manual</h4>
                    <p className="text-yellow-700 text-sm">
                      Você pode ter cancelado a doação durante o processo de pagamento
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">Problema no Cartão</h4>
                    <p className="text-red-700 text-sm">
                      Cartão recusado, dados incorretos ou limite insuficiente
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Problema Técnico</h4>
                    <p className="text-blue-700 text-sm">
                      Instabilidade na conexão ou erro temporário do sistema
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-1">Timeout da Sessão</h4>
                    <p className="text-purple-700 text-sm">
                      Tempo limite excedido durante o processo de pagamento
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Alternative Methods */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-12"
        >
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3" style={{ color: 'var(--color-text-dark)' }}>
              <Heart className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
              Outras Formas de Doar
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Smartphone className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-bold text-green-800 mb-2">PIX</h4>
                <p className="text-green-700 text-sm mb-4">
                  Forma mais rápida e prática de doar. Instantâneo e sem taxas.
                </p>
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="text-green-600 hover:text-green-700 border-green-300"
                >
                  Ver Chave PIX
                </Button>
              </div>

              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-bold text-blue-800 mb-2">Tentar Novamente</h4>
                <p className="text-blue-700 text-sm mb-4">
                  Tente novamente com cartão de crédito ou use outro método de pagamento.
                </p>
                <Button
                  variant="outline"
                  onClick={handleTryAgain}
                  className="text-blue-600 hover:text-blue-700 border-blue-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3" style={{ color: 'var(--color-text-dark)' }}>
              <MessageCircle className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
              Precisa de Ajuda?
            </h3>

            <div className="text-center mb-6">
              <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
                Se você continuar enfrentando problemas para fazer sua doação, 
                nossa equipe está pronta para ajudar. Entre em contato conosco:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-green-800 mb-2">WhatsApp</h4>
                <p className="text-green-700 text-sm mb-3">{contactInfo.whatsapp}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsAppClick}
                  className="text-green-600 hover:text-green-700 border-green-300"
                >
                  Conversar
                </Button>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-blue-800 mb-2">E-mail</h4>
                <p className="text-blue-700 text-sm mb-3">{contactInfo.email}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailClick}
                  className="text-blue-600 hover:text-blue-700 border-blue-300"
                >
                  Enviar E-mail
                </Button>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <svg className="h-8 w-8 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <h4 className="font-semibold text-gray-800 mb-2">Telefone</h4>
                <p className="text-gray-700 text-sm mb-3">{contactInfo.phone}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${contactInfo.phone}`, '_self')}
                  className="text-gray-600 hover:text-gray-700 border-gray-300"
                >
                  Ligar
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Encouragement Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <Card className="p-8 text-center" style={{ background: 'linear-gradient(to right, var(--color-accent-2), var(--color-accent-1))', opacity: 0.1 }}>
            <Church className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-primary-from)' }} />
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary-from)' }}>
              Sua Intenção é o que Importa
            </h3>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-dark)' }}>
              Agradecemos sua intenção de contribuir com a preservação da Capela São Miguel. 
              Sua generosidade e boa vontade já são uma bênção para nossa comunidade. 
              Quando estiver pronto, estaremos aqui para receber sua colaboração.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};