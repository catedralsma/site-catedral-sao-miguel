import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Church } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload'; // Assuming FileUpload passes a File object
import { supabase, Parish } from '../../lib/supabase';
import { invalidateThemeCache } from '../../lib/theme';
import toast from 'react-hot-toast';

export const ParishManager: React.FC = () => {
  const [parish, setParish] = useState<Partial<Parish>>({
    name: '',
    history: '',
    founded_year: 1560,
    address: '',
    phone: '',
    email: '',
    whatsapp_number: null,
    facebook_username: null,
    instagram_username: null,
    twitter_username: null,
    youtube_channel: null,
    logo_url: null,
    logo_url_dark: null,
    logo_url_light: null
  });
  const [heroSettings, setHeroSettings] = useState({
    site_hero_title: 'Tradição e Fé',
    site_hero_description: 'Uma catedral histórica no coração de São Miguel Paulista, sendo referência de fé e tradição para toda a região. Um lugar sagrado onde gerações encontram paz e esperança.'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState({
    original: false,
    dark: false,
    light: false
  });

  useEffect(() => {
    fetchParishData();
    fetchHeroSettings();
  }, []);

  const fetchParishData = async () => {
    try {
      console.log('Fetching parish data...');
      const { data, error } = await supabase
        .from('parishes')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Fetch error:', error);
        throw error;
      }

      if (data) {
        console.log('Fetched parish data:', data);
        setParish(data);
      } else {
        console.log('No parish data found, using defaults');
      }
    } catch (error) {
      console.error('Error fetching parish data:', error);
    }
  };

  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['site_hero_title', 'site_hero_description']);

      if (error) {
        console.error('Error fetching hero settings:', error);
        return;
      }

      if (data) {
        const settings: any = {};
        data.forEach(setting => {
          settings[setting.key] = setting.value;
        });
        
        setHeroSettings(prev => ({
          ...prev,
          site_hero_title: settings.site_hero_title || 'Tradição e Fé',
          site_hero_description: settings.site_hero_description || 'Uma catedral histórica no coração de São Miguel Paulista, sendo referência de fé e tradição para toda a região. Um lugar sagrado onde gerações encontram paz e esperança.'
        }));
      }
    } catch (error) {
      console.error('Error fetching hero settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Debug: Log current parish state
      console.log('Current parish state before save:', parish);
      
      // Prepare data with explicit logo fields
      const parishDataToSave = {
        name: parish.name || '',
        history: parish.history || '',
        founded_year: parish.founded_year || 1622,
        address: parish.address || '',
        phone: parish.phone || '',
        email: parish.email || '',
        whatsapp_number: parish.whatsapp_number || null,
        facebook_username: parish.facebook_username || null,
        instagram_username: parish.instagram_username || null,
        twitter_username: parish.twitter_username || null,
        youtube_channel: parish.youtube_channel || null,
        business_hours: parish.business_hours || null,
        logo_url: parish.logo_url || null,
        logo_url_dark: parish.logo_url_dark || null,
        logo_url_light: parish.logo_url_light || null,
        cloudinary_public_id: parish.cloudinary_public_id || null,
        cloudinary_public_id_dark: parish.cloudinary_public_id_dark || null,
        cloudinary_public_id_light: parish.cloudinary_public_id_light || null,
        updated_at: new Date().toISOString()
      };

      console.log('Data to save:', parishDataToSave);

      // Use upsert to handle both insert and update
      let savedData;
      let upsertError;

      // Check if we have an existing parish record
      const { data: existingParish } = await supabase
        .from('parishes')
        .select('id')
        .limit(1)
        .single();

      if (existingParish) {
        // Update existing record
        const { data, error } = await supabase
          .from('parishes')
          .update(parishDataToSave)
          .eq('id', existingParish.id)
          .select()
          .single();
        savedData = data;
        upsertError = error;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('parishes')
          .insert([{ ...parishDataToSave, id: crypto.randomUUID() }])
          .select()
          .single();
        savedData = data;
        upsertError = error;
      }

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        throw upsertError;
      }

      console.log('Saved data:', savedData);
      
      // Update local state with saved data
      if (savedData) {
        setParish(savedData);
      }

      // Save hero settings to system_settings
      const heroSettingsArray = [
        {
          key: 'site_hero_title',
          value: heroSettings.site_hero_title,
          description: 'Título principal da página inicial',
          is_encrypted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          key: 'site_hero_description', 
          value: heroSettings.site_hero_description,
          description: 'Descrição principal da página inicial',
          is_encrypted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      for (const setting of heroSettingsArray) {
        const { error: upsertError } = await supabase
          .from('system_settings')
          .upsert(setting, { onConflict: 'key' });
        
        if (upsertError) throw upsertError;
      }

      // Invalidate theme cache to reflect changes
      invalidateThemeCache();

      toast.success('Informações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving parish data:', error);
      toast.error('Erro ao salvar informações');
    } finally {
      setIsLoading(false);
    }
  };

  // This is the single, corrected image upload function
  const handleCloudinaryUpload = async (result: { publicId: string; url: string; secureUrl: string }, logoType: 'original' | 'dark' | 'light' = 'original') => {
    console.log(`Cloudinary upload for ${logoType}:`, result);
    if (logoType === 'dark') {
      setParish(prev => ({ 
        ...prev, 
        logo_url_dark: result.secureUrl,
        cloudinary_public_id_dark: result.publicId 
      }));
      console.log('Updated parish state with dark logo:', result.secureUrl);
    } else if (logoType === 'light') {
      setParish(prev => ({ 
        ...prev, 
        logo_url_light: result.secureUrl,
        cloudinary_public_id_light: result.publicId 
      }));
      console.log('Updated parish state with light logo:', result.secureUrl);
    } else {
      setParish(prev => ({ 
        ...prev, 
        logo_url: result.secureUrl,
        cloudinary_public_id: result.publicId 
      }));
      console.log('Updated parish state with main logo:', result.secureUrl);
    }
    toast.success('Logo carregado com sucesso!');
  };

  const handleSupabaseUpload = async (result: { url: string; path: string }, logoType: 'original' | 'dark' | 'light' = 'original') => {
    if (logoType === 'dark') {
      setParish(prev => ({ ...prev, logo_url_dark: result.url }));
    } else if (logoType === 'light') {
      setParish(prev => ({ ...prev, logo_url_light: result.url }));
    } else {
      setParish(prev => ({ ...prev, logo_url: result.url }));
    }
    toast.success('Logo carregado com sucesso!');
  };

  const handleLogoUpload = async (files: FileList | null, logoType: 'original' | 'dark' | 'light' = 'original') => {
    const file = files?.[0];
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [logoType]: true }));
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande (máximo 5MB)');
        return;
      }

      const fileExt = file.name.split('.').pop();
      // Ensure a consistent file name for the logo, using upsert to replace it
      const fileName = `logo-${logoType}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload the file, using upsert to overwrite if it exists
      const { error: uploadError } = await supabase.storage
        .from('parish-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from('parish-photos')
        .getPublicUrl(filePath);

      if (logoType === 'dark') {
        setParish(prev => ({ ...prev, logo_url_dark: urlData.publicUrl }));
      } else if (logoType === 'light') {
        setParish(prev => ({ ...prev, logo_url_light: urlData.publicUrl }));
      } else {
        setParish(prev => ({ ...prev, logo_url: urlData.publicUrl }));
      }
      toast.success('Logo carregado com sucesso!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao carregar logo');
    } finally {
      setIsUploading(prev => ({ ...prev, [logoType]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Informações da Paróquia</h3>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4" />
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Principal da Página (Hero)
              </label>
              <input
                type="text"
                value={heroSettings.site_hero_title}
                onChange={(e) => setHeroSettings(prev => ({ ...prev, site_hero_title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Tradição e Fé"
              />
              <p className="text-xs text-gray-500 mt-1">
                Título que aparece na seção principal da página inicial
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Principal da Página (Hero)
              </label>
              <textarea
                value={heroSettings.site_hero_description}
                onChange={(e) => setHeroSettings(prev => ({ ...prev, site_hero_description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Descrição que aparece na seção principal"
              />
              <p className="text-xs text-gray-500 mt-1">
                Descrição que aparece abaixo do título principal na página inicial
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Catedral
              </label>
              <input
                type="text"
                value={parish.name || ''}
                onChange={(e) => setParish(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome completo da catedral"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano de Fundação
              </label>
              <input
                type="number"
                value={parish.founded_year || ''}
                onChange={(e) => setParish(prev => ({ ...prev, founded_year: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={parish.address || ''}
                onChange={(e) => setParish(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Endereço completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={parish.phone || ''}
                onChange={(e) => setParish(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={parish.email || ''}
                onChange={(e) => setParish(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contato@catedralsaomiguel.com.br"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp (separado do telefone principal)
              </label>
              <input
                type="text"
                value={parish.whatsapp_number || ''}
                onChange={(e) => setParish(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="11999999999 (apenas números)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número do WhatsApp (apenas números, sem espaços ou símbolos)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horários de Atendimento
              </label>
              <textarea
                value={parish.business_hours || ''}
                onChange={(e) => setParish(prev => ({ ...prev, business_hours: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Segunda a Sexta: 9h às 17h&#10;Sábado: 9h às 12h&#10;Domingo: Após as missas"
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite os horários de atendimento da secretaria paroquial (uma linha por horário)
              </p>
            </div>
          </div>
        </Card>

        {/* Logo Upload */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Logos da Catedral</h4>
          
          <div className="space-y-6">
            {/* Logo Original */}
            <div className="text-center">
              <h5 className="text-md font-medium text-gray-700 mb-3">Logo Principal (Uso Geral)</h5>
              {parish.logo_url ? (
                <div className="mb-4">
                  <img
                    src={parish.logo_url}
                    alt="Logo Principal da Catedral"
                    className="w-32 h-32 object-contain mx-auto rounded-lg border border-gray-200"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Church className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <FileUpload
                onCloudinaryUpload={(result) => handleCloudinaryUpload(result, 'original')}
                onSupabaseUpload={(result) => handleSupabaseUpload(result, 'original')}
                onFileSelect={(files) => handleLogoUpload(files, 'original')}
                disabled={isUploading.original}
                folder="logos"
              >
                <Button variant="secondary" disabled={isUploading.original} size="sm">
                  <Church className="h-4 w-4" />
                  {isUploading.original ? 'Carregando...' : 'Carregar Logo Principal'}
                </Button>
              </FileUpload>
              {parish.logo_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParish(prev => ({ ...prev, logo_url: null, cloudinary_public_id: null }))}
                  className="text-red-600 mt-2"
                >
                  Remover
                </Button>
              )}
            </div>

            {/* Logo para Fundo Claro (Logo Escuro) */}
            <div className="text-center">
              <h5 className="text-md font-medium text-gray-700 mb-3">Logo para Fundo Claro (Logo Escuro)</h5>
              {parish.logo_url_dark ? (
                <div className="mb-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                    <img
                      src={parish.logo_url_dark}
                      alt="Logo Escuro da Catedral"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
                  <Church className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <FileUpload
                onCloudinaryUpload={(result) => handleCloudinaryUpload(result, 'dark')}
                onSupabaseUpload={(result) => handleSupabaseUpload(result, 'dark')}
                onFileSelect={(files) => handleLogoUpload(files, 'dark')}
                disabled={isUploading.dark}
                folder="logos"
              >
                <Button variant="outline" disabled={isUploading.dark} size="sm">
                  <Church className="h-4 w-4" />
                  {isUploading.dark ? 'Carregando...' : 'Carregar Logo Escuro'}
                </Button>
              </FileUpload>
              {parish.logo_url_dark && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParish(prev => ({ ...prev, logo_url_dark: null, cloudinary_public_id_dark: null }))}
                  className="text-red-600 mt-2"
                >
                  Remover
                </Button>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Recomendado: Logo escuro/colorido para usar em fundos claros
              </p>
            </div>

            {/* Logo para Fundo Escuro (Logo Claro) */}
            <div className="text-center">
              <h5 className="text-md font-medium text-gray-700 mb-3">Logo para Fundo Escuro (Logo Claro)</h5>
              {parish.logo_url_light ? (
                <div className="mb-4">
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-200 inline-block">
                    <img
                      src={parish.logo_url_light}
                      alt="Logo Claro da Catedral"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-800">
                  <Church className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <FileUpload
                onCloudinaryUpload={(result) => handleCloudinaryUpload(result, 'light')}
                onSupabaseUpload={(result) => handleSupabaseUpload(result, 'light')}
                onFileSelect={(files) => handleLogoUpload(files, 'light')}
                disabled={isUploading.light}
                folder="logos"
              >
                <Button variant="outline" disabled={isUploading.light} size="sm">
                  <Church className="h-4 w-4" />
                  {isUploading.light ? 'Carregando...' : 'Carregar Logo Claro'}
                </Button>
              </FileUpload>
              {parish.logo_url_light && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParish(prev => ({ ...prev, logo_url_light: null, cloudinary_public_id_light: null }))}
                  className="text-red-600 mt-2"
                >
                  Remover
                </Button>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Recomendado: Logo branco/claro para usar no cabeçalho (fundo escuro)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h6 className="font-semibold text-blue-800 mb-2">💡 Dicas para Logos:</h6>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Logo Principal:</strong> Versão colorida padrão</li>
                <li>• <strong>Logo Escuro:</strong> Para fundos claros (rodapé, seções brancas)</li>
                <li>• <strong>Logo Claro:</strong> Para fundos escuros (cabeçalho azul)</li>
                <li>• <strong>Formato:</strong> PNG com fundo transparente funciona melhor</li>
                <li>• <strong>Tamanho:</strong> Mínimo 200x200px para qualidade</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Preview dos Logos */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Preview dos Logos</h4>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Preview Fundo Claro */}
            <div className="text-center">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Em Fundo Claro</h5>
              <div className="bg-white border border-gray-200 rounded-lg p-6 h-32 flex items-center justify-center">
                {parish.logo_url_dark ? (
                  <img
                    src={parish.logo_url_dark}
                    alt="Preview Logo Escuro"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : parish.logo_url ? (
                  <img
                    src={parish.logo_url}
                    alt="Preview Logo Principal"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Church className="h-8 w-8 text-gray-400" />
                )}
              </div>
            </div>

            {/* Preview Fundo Escuro */}
            <div className="text-center">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Em Fundo Escuro (Cabeçalho)</h5>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 h-32 flex items-center justify-center">
                {parish.logo_url_light ? (
                  <img
                    src={parish.logo_url_light}
                    alt="Preview Logo Claro"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : parish.logo_url ? (
                  <img
                    src={parish.logo_url}
                    alt="Preview Logo Principal"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Church className="h-8 w-8 text-gray-400" />
                )}
              </div>
            </div>

            {/* Preview Rodapé */}
            <div className="text-center">
              <h5 className="text-sm font-medium text-gray-700 mb-3">No Rodapé</h5>
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 h-32 flex items-center justify-center">
                {parish.logo_url_dark ? (
                  <img
                    src={parish.logo_url_dark}
                    alt="Preview Logo Rodapé"
                    className="max-w-full max-h-full object-contain opacity-80"
                  />
                ) : parish.logo_url ? (
                  <img
                    src={parish.logo_url}
                    alt="Preview Logo Principal"
                    className="max-w-full max-h-full object-contain opacity-80"
                  />
                ) : (
                  <img
                    src="/footer.webp"
                    alt="Footer padrão"
                    className="max-w-full max-h-full object-contain opacity-80"
                  />
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Redes Sociais */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Redes Sociais</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook (nome de usuário)
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-sm">
                  facebook.com/
                </span>
                <input
                  type="text"
                  value={parish.facebook_username || ''}
                  onChange={(e) => setParish(prev => ({ ...prev, facebook_username: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="catedralsaomiguel"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Apenas o nome de usuário (sem @ ou URL completa)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram (nome de usuário)
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={parish.instagram_username || ''}
                  onChange={(e) => setParish(prev => ({ ...prev, instagram_username: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="catedralsaomiguel"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter/X (nome de usuário)
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={parish.twitter_username || ''}
                  onChange={(e) => setParish(prev => ({ ...prev, twitter_username: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="catedralsm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube (canal)
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-sm">
                  youtube.com/
                </span>
                <input
                  type="text"
                  value={parish.youtube_channel || ''}
                  onChange={(e) => setParish(prev => ({ ...prev, youtube_channel: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@catedralsaomiguel ou c/CatedralSaoMiguel"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Nome do canal (com @) ou ID do canal (com c/)
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* History */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">História da Catedral</h4>
        <textarea
          value={parish.history || ''}
          onChange={(e) => setParish(prev => ({ ...prev, history: e.target.value }))}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Conte a história da catedral, seus marcos importantes, crescimento da comunidade..."
        />
        <p className="text-xs text-gray-500 mt-2">
          Use parágrafos separados por linha em branco para melhor formatação
        </p>
      </Card>
    </div>
  );
};
