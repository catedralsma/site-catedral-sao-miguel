import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Heart, Download, Calendar, User, DollarSign, CreditCard, Church, Gift, Star } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface DonationSuccessPageProps {
  onBack: () => void;
  sessionId: string | null;
}

interface DonationDetails {
  id: string;
  amount: number;
  currency: string;
  donor_name: string | null;
  donor_email: string | null;
  donation_purpose: string | null;
  message: string | null;
  created_at: string;
  status: string;
}

export const DonationSuccessPage: React.FC<DonationSuccessPageProps> = ({ onBack, sessionId }) => {
  const [donation, setDonation] = useState<DonationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [thanksMessage, setThanksMessage] = useState('');

  useEffect(() => {
    fetchDonationDetails();
    fetchThanksMessage();
  }, [sessionId]);

  const fetchDonationDetails = async () => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single();

      if (error) throw error;
      setDonation(data);
    } catch (error) {
      console.error('Error fetching donation details:', error);
      toast.error('Erro ao carregar detalhes da doação');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchThanksMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'capela_donation_thanks_message')
        .single();

      if (data) {
        setThanksMessage(data.value);
      } else {
        setThanksMessage('Muito obrigado pela sua generosidade! Sua doação será fundamental para a preservação da Capela São Miguel.');
      }
    } catch (error) {
      console.error('Error fetching thanks message:', error);
      setThanksMessage('Muito obrigado pela sua generosidade! Sua doação será fundamental para a preservação da Capela São Miguel.');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const generateReceipt = () => {
    if (!donation) return;

    const receiptContent = `
COMPROVANTE DE DOAÇÃO
Capela São Miguel Arcanjo

Data: ${new Date(donation.created_at).toLocaleDateString('pt-BR')}
Valor: ${formatCurrency(donation.amount, donation.currency)}
${donation.donor_name ? `Doador: ${donation.donor_name}` : ''}
${donation.donation_purpose ? `Finalidade: ${donation.donation_purpose}` : ''}
${donation.message ? `Mensagem: ${donation.message}` : ''}

ID da Transação: ${donation.id}
Status: ${donation.status}

Obrigado pela sua contribuição!
Capela São Miguel Arcanjo
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovante-doacao-${donation.id.substring(0, 8)}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary-from)' }}></div>
          <p className="text-gray-600">Processando sua doação...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl sm:text-3xl font-bold">Doação Realizada</h1>
                <p className="text-sm sm:text-base truncate" style={{ color: 'var(--color-accent-2)' }}>
                  Obrigado pela sua generosidade!
                </p>
              </div>
            </div>
            <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0" style={{ color: 'var(--color-accent-2)' }} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Animation */}
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
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-100"
            >
              <CheckCircle className="h-16 w-16 text-green-600" />
            </motion.div>
            
            {/* Confetti effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: -100, opacity: 0 }}
                  transition={{ duration: 2, delay: 0.5 + i * 0.1 }}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${50 + (i - 3) * 10}%`,
                    top: '50%'
                  }}
                />
              ))}
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-3xl sm:text-4xl font-bold mb-4 text-green-800"
          >
            Doação Realizada com Sucesso!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed"
          >
            {thanksMessage}
          </motion.p>
        </motion.div>

        {/* Donation Details */}
        {donation && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-12"
          >
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3" style={{ color: 'var(--color-text-dark)' }}>
                <Gift className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
                Detalhes da Sua Doação
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Valor Doado</p>
                      <p className="text-2xl font-bold text-green-800">
                        {formatCurrency(donation.amount, donation.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Data da Doação</p>
                      <p className="font-semibold text-blue-800">
                        {new Date(donation.created_at).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {donation.donor_name && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-6 w-6 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Doador</p>
                        <p className="font-semibold text-gray-800">{donation.donor_name}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Método</p>
                      <p className="font-semibold text-purple-800">Cartão de Crédito (Stripe)</p>
                    </div>
                  </div>
                </div>
              </div>

              {donation.donation_purpose && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Finalidade da Doação</h4>
                  <p className="text-blue-700">{donation.donation_purpose}</p>
                </div>
              )}

              {donation.message && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Sua Mensagem</h4>
                  <p className="text-green-700">{donation.message}</p>
                </div>
              )}

              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={generateReceipt}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar Comprovante
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-12"
        >
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3" style={{ color: 'var(--color-text-dark)' }}>
              <Star className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
              Próximos Passos
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Church className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-bold text-blue-800 mb-2">Visite a Capela</h4>
                <p className="text-blue-700 text-sm">
                  Conheça pessoalmente o patrimônio histórico que você está ajudando a preservar
                </p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-bold text-green-800 mb-2">Acompanhe o Progresso</h4>
                <p className="text-green-700 text-sm">
                  Siga nossas redes sociais para ver como sua doação está fazendo a diferença
                </p>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <Gift className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h4 className="font-bold text-purple-800 mb-2">Compartilhe</h4>
                <p className="text-purple-700 text-sm">
                  Convide amigos e familiares a conhecer e apoiar a Capela São Miguel
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Card className="p-8 text-center" style={{ background: 'linear-gradient(to right, var(--color-accent-2), var(--color-accent-1))', opacity: 0.1 }}>
            <Church className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-primary-from)' }} />
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary-from)' }}>
              Dúvidas sobre sua Doação?
            </h3>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed mb-6" style={{ color: 'var(--color-text-dark)' }}>
              Se você tiver alguma dúvida sobre sua doação ou precisar de um comprovante adicional, 
              entre em contato conosco. Estamos aqui para ajudar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => window.open('https://wa.me/5511999999999?text=' + encodeURIComponent('Olá! Tenho uma dúvida sobre minha doação para a Capela São Miguel.'), '_blank')}
                className="flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('mailto:doacoes@catedralsaomiguel.com.br', '_blank')}
                className="flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                E-mail
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};