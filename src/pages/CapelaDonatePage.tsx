import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Copy, Check, CreditCard, Building, Smartphone, DollarSign, Shield, Info, Gift, Church, Star, Users, Loader } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CapelaDonatePage {
  onBack: () => void;
}

interface DonationSettings {
  capela_donation_enabled: boolean;
  capela_donation_title: string;
  capela_donation_subtitle: string;
  capela_donation_description: string;
  capela_pix_key: string;
  capela_pix_name: string;
  capela_pix_description: string;
  capela_bank_name: string;
  capela_bank_agency: string;
  capela_bank_account: string;
  capela_bank_account_type: string;
  capela_bank_cnpj: string;
  capela_donation_methods: string;
  capela_donation_purposes: string;
  capela_stripe_enabled: boolean;
  capela_donation_thanks_message: string;
  capela_donation_contact_info: string;
  capela_suggested_amounts: string;
  capela_minimum_amount: string;
  capela_transparency_enabled: boolean;
  capela_transparency_text: string;
}

interface StripeSettings {
  stripe_enabled: boolean;
  stripe_publishable_key: string;
  stripe_minimum_amount: string;
  stripe_currency: string;
  stripe_company_name: string;
}

const defaultSettings: DonationSettings = {
  capela_donation_enabled: true,
  capela_donation_title: 'Colabore com a Capela São Miguel',
  capela_donation_subtitle: 'Ajude a preservar o templo mais antigo de São Paulo',
  capela_donation_description: 'Sua doação é fundamental para a manutenção e preservação da Capela São Miguel, um patrimônio histórico de mais de 460 anos.',
  capela_pix_key: '',
  capela_pix_name: 'Capela São Miguel Arcanjo',
  capela_pix_description: 'Doação para manutenção da Capela São Miguel',
  capela_bank_name: '',
  capela_bank_agency: '',
  capela_bank_account: '',
  capela_bank_account_type: 'Conta Corrente',
  capela_bank_cnpj: '',
  capela_donation_methods: 'PIX (instantâneo)\nTransferência Bancária\nCartão de Crédito (em breve)\nDoação Presencial na Capela',
  capela_donation_purposes: 'Manutenção do patrimônio histórico\nRestauração de elementos arquitetônicos\nConservação dos vitrais centenários\nMelhorias na infraestrutura\nAções sociais da capela\nEventos e celebrações especiais',
  capela_stripe_enabled: false,
  capela_donation_thanks_message: 'Muito obrigado pela sua generosidade! Sua doação será fundamental para a preservação da Capela São Miguel.',
  capela_donation_contact_info: 'Para dúvidas sobre doações, entre em contato:\nTelefone: (11) 2032-4160\nE-mail: doacoes@catedralsaomiguel.com.br',
  capela_suggested_amounts: '25,50,100,200,500',
  capela_minimum_amount: '10',
  capela_transparency_enabled: true,
  capela_transparency_text: 'Todas as doações são utilizadas exclusivamente para a manutenção e preservação da Capela São Miguel. Relatórios de prestação de contas estão disponíveis mediante solicitação.'
};

export const CapelaDonatePage: React.FC<CapelaDonatePage> = ({ onBack }) => {
  const [settings, setSettings] = useState<DonationSettings>(defaultSettings);
  const [stripeSettings, setStripeSettings] = useState<StripeSettings>({
    stripe_enabled: false,
    stripe_publishable_key: '',
    stripe_minimum_amount: '10',
    stripe_currency: 'BRL',
    stripe_company_name: 'Capela São Miguel Arcanjo'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copiedPix, setCopiedPix] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    purpose: '',
    message: ''
  });

  useEffect(() => {
    fetchDonationSettings();
    fetchStripeSettings();
  }, []);

  const fetchDonationSettings = async () => {
    setIsLoading(true);
    try {
      const settingKeys = Object.keys(defaultSettings) as Array<keyof DonationSettings>;
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', settingKeys);

      if (error) throw error;

      const fetchedSettings: Partial<DonationSettings> = {};
      data?.forEach(setting => {
        if (setting.key === 'capela_donation_enabled' || setting.key === 'capela_stripe_enabled' || setting.key === 'capela_transparency_enabled') {
          fetchedSettings[setting.key] = setting.value === 'true';
        } else {
          fetchedSettings[setting.key as keyof DonationSettings] = setting.value as any;
        }
      });

      setSettings(prev => ({ ...prev, ...fetchedSettings }));
    } catch (error) {
      console.error('Error fetching donation settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStripeSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['stripe_enabled', 'stripe_publishable_key', 'stripe_minimum_amount', 'stripe_currency', 'stripe_company_name']);

      if (error) throw error;

      const fetchedStripeSettings: Partial<StripeSettings> = {};
      data?.forEach(setting => {
        if (setting.key === 'stripe_enabled') {
          fetchedStripeSettings[setting.key] = setting.value === 'true';
        } else {
          fetchedStripeSettings[setting.key as keyof StripeSettings] = setting.value as any;
        }
      });

      setStripeSettings(prev => ({ ...prev, ...fetchedStripeSettings }));
    } catch (error) {
      console.error('Error fetching Stripe settings:', error);
    }
  };

  const copyPixKey = async () => {
    if (!settings.capela_pix_key) {
      toast.error('Chave PIX não configurada');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(settings.capela_pix_key);
      setCopiedPix(true);
      toast.success('Chave PIX copiada!');
      setTimeout(() => setCopiedPix(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar chave PIX');
    }
  };

  const handlePixDonation = () => {
    if (!settings.capela_pix_key) {
      toast.error('PIX não configurado. Entre em contato conosco.');
      return;
    }

    const amount = selectedAmount || parseFloat(customAmount) || 0;
    if (amount < 1) {
      toast.error('Selecione um valor para doação');
      return;
    }

    // Gerar link do PIX (se possível) ou mostrar instruções
    const pixData = `00020126580014br.gov.bcb.pix0136${settings.capela_pix_key}0208${settings.capela_pix_description}5204000053039865802BR5925${settings.capela_pix_name}6009SAO PAULO62070503***6304`;
    
    toast.success(`Valor selecionado: R$ ${amount.toFixed(2)}. Use a chave PIX copiada para fazer a doação.`);
  };

  const handleStripeDonation = () => {
    if (!stripeSettings.stripe_enabled) {
      toast.error('Doações via cartão ainda não disponíveis. Use PIX ou transferência bancária.');
      return;
    }

    const amount = selectedAmount || parseFloat(customAmount) || 0;
    const minimumAmount = parseFloat(stripeSettings.stripe_minimum_amount);
    if (amount < minimumAmount) {
      toast.error(`Valor mínimo: R$ ${minimumAmount.toFixed(2)}`);
      return;
    }

    if (!donorInfo.email) {
      toast.error('Por favor, preencha seu email para continuar');
      return;
    }

    if (!donorInfo.phone) {
      toast.error('Por favor, preencha seu telefone para continuar');
      return;
    }

    // Validar formato do telefone
    const phonePattern = /^\([0-9]{2}\) (?:[0-9]{4}-[0-9]{4}|[0-9]{5}-[0-9]{4})$/;
    if (!phonePattern.test(donorInfo.phone)) {
      toast.error('Telefone deve estar no formato (00) 0000-0000 ou (00) 00000-0000');
      return;
    }

    processStripeDonation(amount);
  };

  const processStripeDonation = async (amount: number) => {
    setIsProcessingStripe(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: stripeSettings.stripe_currency || 'BRL',
          donor_name: donorInfo.name,
          donor_email: donorInfo.email,
          donor_phone: donorInfo.phone,
          donation_purpose: donorInfo.purpose,
          message: donorInfo.message,
          success_url: `${window.location.origin}/donation-success`,
          cancel_url: `${window.location.origin}/donation-error`
        })
      });

      const data = await response.json();

      // Debug: mostrar a resposta completa para identificar o problema
      console.log('Resposta completa da API Stripe:', data);
      console.log('Propriedades disponíveis:', Object.keys(data));

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar doação');
      }

      // Verificar todas as possíveis propriedades de URL
      const checkoutUrl = data.checkout_url || data.url || data.session_url || data.redirect_url;
      
      if (checkoutUrl) {
        // Redirecionar para o Stripe Checkout
        console.log('Redirecionando para:', checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        throw new Error(`URL de checkout não recebida. Dados recebidos: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Erro ao processar doação Stripe:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao processar doação. Tente novamente.');
    } finally {
      setIsProcessingStripe(false);
    }
  };

  // Melhoria na função de formatação de telefone
  const formatPhoneNumber = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const cleanValue = value.replace(/\D/g, '');

    // Aplica a máscara com base no número de dígitos
    if (cleanValue.length <= 10) {
      // DDD + 8 dígitos (formato fixo)
      return cleanValue
        .replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3')
        .slice(0, 14);
    } else {
      // DDD + 9 dígitos (formato celular)
      return cleanValue
        .replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
        .slice(0, 15);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setDonorInfo(prev => ({ ...prev, phone: formattedNumber }));
  };

  const suggestedAmounts = settings.capela_suggested_amounts.split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary-from)' }}></div>
          <p className="text-gray-600">Carregando página de doações...</p>
        </div>
      </div>
    );
  }

  if (!settings.capela_donation_enabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Doações Temporariamente Indisponíveis
          </h3>
          <p className="text-gray-500 mb-4">
            A página de doações da Capela São Miguel está temporariamente indisponível.
          </p>
          <Button variant="primary" onClick={onBack}>
            Voltar à Capela
          </Button>
        </Card>
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
                <h1 className="text-2xl sm:text-3xl font-bold">{settings.capela_donation_title}</h1>
                <p className="text-sm sm:text-base truncate" style={{ color: 'var(--color-accent-2)' }}>
                  {settings.capela_donation_subtitle}
                </p>
              </div>
            </div>
            <Heart className="h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0" style={{ color: 'var(--color-accent-2)' }} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Card className="p-8">
            <Heart className="h-16 w-16 mx-auto mb-6" style={{ color: 'var(--color-primary-from)' }} />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--color-primary-from)' }}>
              {settings.capela_donation_title}
            </h2>
            <p className="text-xl mb-6" style={{ color: 'var(--color-secondary-from)' }}>
              {settings.capela_donation_subtitle}
            </p>
            <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
              {settings.capela_donation_description}
            </p>
          </Card>
        </motion.div>

        {/* Finalidades das Doações */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3" style={{ color: 'var(--color-text-dark)' }}>
              <Star className="h-6 w-6" style={{ color: 'var(--color-primary-from)' }} />
              Como Sua Doação Ajuda
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {settings.capela_donation_purposes.split('\n').map((purpose, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-from)' }}>
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-gray-700 font-medium">{purpose}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Valores Sugeridos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-dark)' }}>
              Escolha o Valor da Sua Doação
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {suggestedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "primary" : "outline"}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  className="h-16 text-lg font-bold"
                >
                  R$ {amount}
                </Button>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Ou digite um valor personalizado:</p>
              <div className="max-w-xs mx-auto">
                <div className="flex items-center">
                  <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                    R$
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Métodos de Doação */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cartão de Crédito (Stripe) */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  stripeSettings.stripe_enabled ? '' : 'opacity-50'
                }`} style={{ backgroundColor: 'var(--color-accent-1)' }}>
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Cartão de Crédito
                  {!stripeSettings.stripe_enabled && <span className="text-sm text-gray-500 ml-2">(Desabilitado)</span>}
                </h3>
                <p className="text-gray-600 text-sm">Doação segura via cartão de crédito</p>
              </div>

              {stripeSettings.stripe_enabled ? (
                <div className="space-y-4">
                  {/* Formulário de Informações do Doador */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Informações do Doador</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Nome completo"
                        value={donorInfo.name}
                        onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Email *"
                        value={donorInfo.email}
                        onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <input
                        type="tel"
                        placeholder="Telefone (00) 00000-0000"
                        value={donorInfo.phone}
                        onChange={handlePhoneChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Finalidade da doação"
                        value={donorInfo.purpose}
                        onChange={(e) => setDonorInfo(prev => ({ ...prev, purpose: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <textarea
                      placeholder="Mensagem (opcional)"
                      value={donorInfo.message}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, message: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm mt-3 resize-none"
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Valor mínimo: R$ {stripeSettings.stripe_minimum_amount}
                    </p>
                    <Button
                      variant="secondary"
                      onClick={handleStripeDonation}
                      className="flex items-center justify-center gap-2"
                      disabled={(!selectedAmount && !customAmount) || isProcessingStripe || !donorInfo.email}
                    >
                      {isProcessingStripe ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      {isProcessingStripe ? 'Processando...' : 'Doar com Cartão'}
                      {(selectedAmount || customAmount) && (
                        <span>- R$ {selectedAmount || customAmount}</span>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Processamento seguro via Stripe • SSL Criptografado
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-medium mb-2">💳 Stripe Desabilitado</p>
                  <p className="text-yellow-700 text-sm">
                    Configure o Stripe no painel administrativo para habilitar doações via cartão de crédito.
                  </p>
                </div>
              )}
            </Card>
            {/* PIX */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-from)' }}>
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">PIX - Doação Instantânea</h3>
                <p className="text-gray-600 text-sm">Forma mais rápida e prática de doar</p>
              </div>

              {settings.capela_pix_key ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Chave PIX:</h4>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                        {settings.capela_pix_key}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyPixKey}
                        className="flex items-center gap-1"
                      >
                        {copiedPix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedPix ? 'Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Beneficiário:</h4>
                    <p className="text-blue-700">{settings.capela_pix_name}</p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handlePixDonation}
                    className="w-full flex items-center justify-center gap-2"
                    disabled={!selectedAmount && !customAmount}
                  >
                    <Smartphone className="h-4 w-4" />
                    Doar via PIX
                    {(selectedAmount || customAmount) && (
                      <span>- R$ {selectedAmount || customAmount}</span>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">PIX em configuração. Use outros métodos abaixo.</p>
                </div>
              )}
            </Card>

            {/* Transferência Bancária */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary-from)' }}>
                  <Building className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Transferência Bancária</h3>
                <p className="text-gray-600 text-sm">Para doações maiores ou recorrentes</p>
              </div>

              {settings.capela_bank_name ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Banco:</p>
                    <p className="font-semibold text-gray-800">{settings.capela_bank_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Agência:</p>
                      <p className="font-semibold text-gray-800">{settings.capela_bank_agency}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Conta:</p>
                      <p className="font-semibold text-gray-800">{settings.capela_bank_account}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Tipo:</p>
                    <p className="font-semibold text-gray-800">{settings.capela_bank_account_type}</p>
                  </div>
                  {settings.capela_bank_cnpj && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">CNPJ:</p>
                      <p className="font-semibold text-gray-800">{settings.capela_bank_cnpj}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Dados bancários em configuração.</p>
                </div>
              )}
            </Card>
          </div>
        </motion.div>

        {/* Outros Métodos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-12"
        >
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2" style={{ color: 'var(--color-text-dark)' }}>
              <Gift className="h-5 w-5" style={{ color: 'var(--color-primary-from)' }} />
              Outras Formas de Colaborar
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {settings.capela_donation_methods.split('\n').map((method, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-2)' }}>
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-gray-700 font-medium">{method}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Transparência */}
        {settings.capela_transparency_enabled && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mb-12"
          >
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="text-center">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-4">Transparência e Prestação de Contas</h3>
                <p className="text-green-700 leading-relaxed">
                  {settings.capela_transparency_text}
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Informações de Contato */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mb-12"
        >
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2" style={{ color: 'var(--color-text-dark)' }}>
              <Info className="h-5 w-5" style={{ color: 'var(--color-primary-from)' }} />
              Dúvidas sobre Doações
            </h3>
            <div className="text-center">
              {settings.capela_donation_contact_info.split('\n').map((line, index) => (
                <p key={index} className="text-gray-700 mb-2">
                  {line}
                </p>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Mensagem de Agradecimento */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <Card className="p-8 text-center" style={{ background: 'linear-gradient(to right, var(--color-accent-2), var(--color-accent-1))', opacity: 0.1 }}>
            <Users className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-primary-from)' }} />
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary-from)' }}>
              Gratidão
            </h3>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-dark)' }}>
              {settings.capela_donation_thanks_message}
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};