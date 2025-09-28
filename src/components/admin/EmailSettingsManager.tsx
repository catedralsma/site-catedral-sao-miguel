import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, EyeOff, TestTube, CheckCircle, XCircle, Mail, Server, Lock, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface EmailSettings {
  smtp_host: string;
  smtp_port: string;
  smtp_email: string;
  smtp_password: string;
  smtp_secure: boolean;
  smtp_enabled: boolean;
}

export const EmailSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<EmailSettings>({
    smtp_host: '',
    smtp_port: '587',
    smtp_email: '',
    smtp_password: '',
    smtp_secure: true,
    smtp_enabled: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'smtp_host',
          'smtp_port',
          'smtp_email',
          'smtp_password',
          'smtp_secure',
          'smtp_enabled'
        ]);

      if (error) throw error;

      const settingsMap = data?.reduce((acc, setting) => {
        if (setting.key === 'smtp_secure' || setting.key === 'smtp_enabled') {
          acc[setting.key] = setting.value === 'true';
        } else {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as any) || {};

      setSettings(prev => ({ ...prev, ...settingsMap }));
    } catch (error) {
      console.error('Error fetching email settings:', error);
      toast.error('Erro ao carregar configurações de e-mail');
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
        description: `Email setting: ${key}`,
        is_encrypted: key === 'smtp_password',
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert([update], { onConflict: 'key' });

        if (error) throw error;
      }

      toast.success('Configurações de e-mail salvas com sucesso!');
      setTestResult(null); // Reset test result after save
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Erro ao salvar configurações de e-mail');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!settings.smtp_host || !settings.smtp_email || !settings.smtp_password) {
      toast.error('Preencha todas as configurações obrigatórias antes de testar');
      return;
    }

    setIsTesting(true);
    try {
      // Primeiro salvar as configurações
      await handleSave();

      // Simular teste de conexão SMTP
      // Em produção, isso deveria chamar uma Edge Function
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulação de resultado
      const isValid = settings.smtp_host.includes('.') && settings.smtp_email.includes('@');
      
      setTestResult({
        success: isValid,
        message: isValid 
          ? 'Conexão SMTP testada com sucesso! (Simulação)' 
          : 'Erro na conexão SMTP. Verifique as configurações.'
      });

      if (isValid) {
        toast.success('Teste de conexão realizado com sucesso!');
      } else {
        toast.error('Falha no teste de conexão SMTP');
      }
    } catch (error) {
      console.error('Error testing SMTP:', error);
      toast.error('Erro ao testar conexão SMTP');
      setTestResult({
        success: false,
        message: 'Erro interno ao testar conexão'
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Mail className="h-7 w-7 text-blue-600" />
          Configurações de E-mail (SMTP)
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

      {/* Status do Teste */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {testResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-semibold">
              {testResult.success ? 'Teste Bem-sucedido' : 'Teste Falhou'}
            </span>
          </div>
          <p className="text-sm">{testResult.message}</p>
        </motion.div>
      )}

      {/* Aviso sobre Edge Functions */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">⚠️ Funcionalidade Requer Backend</p>
            <p>Para que o envio de e-mails funcione completamente, você precisará criar uma <strong>Supabase Edge Function</strong> que:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Receba os dados do formulário de contato</li>
              <li>Use essas configurações SMTP para enviar e-mails</li>
              <li>Teste a conexão SMTP quando solicitado</li>
            </ul>
            <p className="mt-2 font-medium">Por enquanto, as configurações são salvas e o teste é simulado.</p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configurações do Servidor */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-600" />
            Servidor SMTP
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={settings.smtp_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="font-medium text-gray-700">Habilitar envio de e-mails</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servidor SMTP *
              </label>
              <input
                type="text"
                value={settings.smtp_host}
                onChange={(e) => setSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="smtp.gmail.com"
                disabled={!settings.smtp_enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Ex: smtp.gmail.com, smtp.outlook.com, mail.dominio.com
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porta *
              </label>
              <select
                value={settings.smtp_port}
                onChange={(e) => setSettings(prev => ({ ...prev, smtp_port: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={!settings.smtp_enabled}
              >
                <option value="587">587 (TLS/STARTTLS)</option>
                <option value="465">465 (SSL)</option>
                <option value="25">25 (Não seguro)</option>
                <option value="2525">2525 (Alternativo)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.smtp_secure}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_secure: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  disabled={!settings.smtp_enabled}
                />
                <span className="text-sm font-medium text-gray-700">
                  Usar conexão segura (TLS/SSL)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Recomendado para a maioria dos provedores
              </p>
            </div>
          </div>
        </Card>

        {/* Credenciais */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            Credenciais
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail Remetente *
              </label>
              <input
                type="email"
                value={settings.smtp_email}
                onChange={(e) => setSettings(prev => ({ ...prev, smtp_email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="contato@catedralsaomiguel.com.br"
                disabled={!settings.smtp_enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                E-mail que aparecerá como remetente das mensagens
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha do E-mail *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={settings.smtp_password}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_password: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="••••••••••••••••"
                  disabled={!settings.smtp_enabled}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={!settings.smtp_enabled}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Para Gmail, use uma "Senha de App" em vez da senha normal
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Instruções */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Como Configurar</h4>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">📧 Gmail</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Servidor:</strong> smtp.gmail.com</li>
              <li>• <strong>Porta:</strong> 587</li>
              <li>• <strong>Seguro:</strong> Sim (TLS)</li>
              <li>• <strong>Senha:</strong> Use "Senha de App"</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Como criar Senha de App no Gmail →
              </a>
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-gray-800 mb-2">📧 Outlook/Hotmail</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Servidor:</strong> smtp-mail.outlook.com</li>
              <li>• <strong>Porta:</strong> 587</li>
              <li>• <strong>Seguro:</strong> Sim (TLS)</li>
              <li>• <strong>Senha:</strong> Senha normal da conta</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h5 className="font-semibold text-yellow-800 mb-2">⚠️ Implementação Necessária</h5>
          <p className="text-sm text-yellow-700">
            Para que o envio de e-mails funcione, você precisará criar uma <strong>Supabase Edge Function</strong> que:
          </p>
          <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
            <li>Receba os dados do formulário de contato</li>
            <li>Use essas configurações SMTP para enviar e-mails</li>
            <li>Implemente a lógica de teste de conexão</li>
          </ul>
          <p className="text-sm text-yellow-700 mt-2">
            Consulte a <a href="https://supabase.com/docs/guides/functions" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">documentação do Supabase</a> para criar Edge Functions.
          </p>
        </div>
      </Card>

      {/* Exemplo de Edge Function */}
      <Card className="p-6 bg-gray-50">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Exemplo de Edge Function</h4>
        <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
          <pre>{`// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { name, email, message } = await req.json()
  
  // Buscar configurações SMTP do banco
  // Implementar lógica de envio de e-mail
  // Retornar resultado
  
  return new Response(JSON.stringify({ success: true }))
})`}</pre>
        </div>
      </Card>
    </div>
  );
};