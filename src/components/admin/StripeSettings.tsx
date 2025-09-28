import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, EyeOff, TestTube, CheckCircle, XCircle, CreditCard, DollarSign, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface StripeSettings {
  stripe_publishable_key: string;
  stripe_secret_key: string;
  stripe_webhook_secret: string;
  stripe_enabled: boolean;
  stripe_currency: string;
  stripe_minimum_amount: string;
  stripe_success_url: string;
  stripe_cancel_url: string;
  stripe_company_name: string;
}

const defaultSettings: StripeSettings = {
  stripe_publishable_key: '',
  stripe_secret_key: '',
  stripe_webhook_secret: '',
  stripe_enabled: false,
  stripe_currency: 'BRL',
  stripe_minimum_amount: '10',
  stripe_success_url: '/capela?donation=success',
  stripe_cancel_url: '/capela?donation=cancelled',
  stripe_company_name: 'Capela São Miguel Arcanjo'
};

export const StripeSettings: React.FC = () => {
  const [settings, setSettings] = useState<StripeSettings>(defaultSettings);
  const [showSecrets, setShowSecrets] = useState({
    secret_key: false,
    webhook_secret: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ isValid: boolean; errors: string[] } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const settingKeys = Object.keys(defaultSettings) as Array<keyof StripeSettings>;
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', settingKeys);

      if (error) throw error;

      const fetchedSettings: Partial<StripeSettings> = {};
      data?.forEach(setting => {
        if (setting.key === 'stripe_enabled') {
          fetchedSettings[setting.key] = setting.value === 'true';
        } else {
          fetchedSettings[setting.key as keyof StripeSettings] = setting.value as any;
        }
      });

      setSettings(prev => ({ ...prev, ...fetchedSettings }));
    } catch (error) {
      console.error('Error fetching Stripe settings:', error);
      toast.error('Erro ao carregar configurações do Stripe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? value.toString() : value,
        description: `Stripe setting: ${key}`,
        is_encrypted: key.includes('secret') || key.includes('key'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      toast.success('Configurações do Stripe salvas com sucesso!');
      setTestResult(null);
    } catch (error) {
      console.error('Error saving Stripe settings:', error);
      toast.error('Erro ao salvar configurações do Stripe');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!settings.stripe_publishable_key || !settings.stripe_secret_key) {
      toast.error('Configure as chaves do Stripe primeiro');
      return;
    }

    setIsTesting(true);
    try {
      // Salvar primeiro para testar
      await handleSave();
      
      // Testar a conexão com o Stripe
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-stripe-connection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publishable_key: settings.stripe_publishable_key
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResult({ isValid: true, errors: [] });
        toast.success('Conexão com Stripe testada com sucesso!');
      } else {
        setTestResult({ isValid: false, errors: [result.error || 'Erro desconhecido'] });
        toast.error('Erro na conexão com Stripe');
      }
    } catch (error) {
      console.error('Error testing Stripe:', error);
      setTestResult({ isValid: false, errors: ['Erro interno ao testar conexão'] });
      toast.error('Erro ao testar configuração');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-blue-600" />
          Configurações do Stripe
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting || isSaving}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {isTesting ? 'Testando...' : 'Testar Conexão'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isTesting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Status da Configuração */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            testResult.isValid 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {testResult.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-semibold">
              {testResult.isValid ? 'Stripe Configurado Corretamente' : 'Erro na Configuração do Stripe'}
            </span>
          </div>
          {testResult.errors.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-sm">
              {testResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configurações Básicas */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Configurações Básicas</h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={settings.stripe_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, stripe_enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">Habilitar Stripe (Cartão de Crédito)</span>
              </label>
              <p className="text-sm text-gray-500">
                Quando habilitado, os usuários poderão fazer doações via cartão de crédito
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave Publicável (Publishable Key) *
              </label>
              <input
                type="text"
                value={settings.stripe_publishable_key}
                onChange={(e) => setSettings(prev => ({ ...prev, stripe_publishable_key: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="pk_test_..."
                disabled={!settings.stripe_enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Encontre em: Dashboard → Developers → API keys
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave Secreta (Secret Key) *
              </label>
              <div className="relative">
                <input
                  type={showSecrets.secret_key ? "text" : "password"}
                  value={settings.stripe_secret_key}
                  onChange={(e) => setSettings(prev => ({ ...prev, stripe_secret_key: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="sk_test_..."
                  disabled={!settings.stripe_enabled}
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(prev => ({ ...prev, secret_key: !prev.secret_key }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={!settings.stripe_enabled}
                >
                  {showSecrets.secret_key ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret
              </label>
              <div className="relative">
                <input
                  type={showSecrets.webhook_secret ? "text" : "password"}
                  value={settings.stripe_webhook_secret}
                  onChange={(e) => setSettings(prev => ({ ...prev, stripe_webhook_secret: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="whsec_..."
                  disabled={!settings.stripe_enabled}
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(prev => ({ ...prev, webhook_secret: !prev.webhook_secret }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={!settings.stripe_enabled}
                >
                  {showSecrets.webhook_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Configurado após criar o webhook endpoint
              </p>
            </div>
          </div>
        </Card>

        {/* Configurações de Pagamento */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Pagamento</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moeda
              </label>
              <select
                value={settings.stripe_currency}
                onChange={(e) => setSettings(prev => ({ ...prev, stripe_currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={!settings.stripe_enabled}
              >
                <option value="BRL">Real Brasileiro (BRL)</option>
                <option value="USD">Dólar Americano (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Mínimo (R$)
              </label>
              <input
                type="number"
                value={settings.stripe_minimum_amount}
                onChange={(e) => setSettings(prev => ({ ...prev, stripe_minimum_amount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="10"
                min="1"
                step="0.01"
                disabled={!settings.stripe_enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa/Organização
              </label>
              <input
                type="text"
                value={settings.stripe_company_name}
                onChange={(e) => setSettings(prev => ({ ...prev, stripe_company_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Capela São Miguel Arcanjo"
                disabled={!settings.stripe_enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Sucesso
              </label>
              <input
                type="text"
                value={settings.stripe_success_url}
                onChange={(e) => setSettings(prev => ({ ...prev, stripe_success_url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="/capela?donation=success"
                disabled={!settings.stripe_enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Cancelamento
              </label>
              <input
                type="text"
                value={settings.stripe_cancel_url}
                onChange={(e) => setSettings(prev => ({ ...prev, stripe_cancel_url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="/capela?donation=cancelled"
                disabled={!settings.stripe_enabled}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Instruções */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Como Configurar o Stripe</h4>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">1. Criar Conta no Stripe</h5>
            <p>Acesse <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dashboard.stripe.com</a> e crie uma conta.</p>
          </div>

          <div>
            <h5 className="font-semibold text-gray-800 mb-2">2. Obter Chaves de API</h5>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Vá para Dashboard → Developers → API keys</li>
              <li>Copie a <strong>Publishable key</strong> (começa com pk_)</li>
              <li>Copie a <strong>Secret key</strong> (começa com sk_)</li>
              <li>Use as chaves de <strong>test</strong> para desenvolvimento</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-gray-800 mb-2">3. Configurar Webhook</h5>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Vá para Dashboard → Developers → Webhooks</li>
              <li>Clique em "Add endpoint"</li>
              <li>URL: <code>{import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook</code></li>
              <li>Eventos: <code>checkout.session.completed</code>, <code>payment_intent.succeeded</code></li>
              <li>Copie o <strong>Signing secret</strong> (começa com whsec_)</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-gray-800 mb-2">4. Benefícios</h5>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Pagamentos seguros via cartão de crédito</li>
              <li>Processamento automático de doações</li>
              <li>Relatórios detalhados de transações</li>
              <li>Suporte a múltiplas moedas</li>
              <li>Proteção contra fraudes</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Aviso de Segurança */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-yellow-600 mt-1" />
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">Segurança das Chaves</h4>
            <div className="text-yellow-700 text-sm space-y-2">
              <p>• As chaves secretas são criptografadas no banco de dados</p>
              <p>• Nunca compartilhe suas chaves secretas</p>
              <p>• Use chaves de teste durante o desenvolvimento</p>
              <p>• Monitore regularmente as transações no dashboard do Stripe</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Status do Sistema */}
      {settings.stripe_enabled && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Sistema de Doações Ativo</h4>
              <div className="text-green-700 text-sm space-y-2">
                <p>• Doações via cartão de crédito habilitadas</p>
                <p>• Moeda: {settings.stripe_currency}</p>
                <p>• Valor mínimo: R$ {settings.stripe_minimum_amount}</p>
                <p>• Processamento seguro via Stripe</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};