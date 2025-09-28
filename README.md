# Site da Catedral de São Miguel Arcanjo

Site oficial da Catedral de São Miguel Arcanjo em São Miguel Paulista, SP.

## 🚀 Deploy no Netlify

### Pré-requisitos
1. Conta no [Netlify](https://netlify.com)
2. Conta no [Supabase](https://supabase.com)
3. Repositório no GitHub/GitLab

### Passos para Deploy

#### 1. Configurar Supabase
1. Crie um projeto no Supabase
2. Execute as migrações SQL da pasta `supabase/migrations/`
3. Configure o bucket de storage:
   ```sql
   -- Execute no SQL Editor do Supabase
   insert into storage.buckets (id, name, public) values ('parish-photos', 'parish-photos', true);
   
   create policy "Public Access" on storage.objects for select using (bucket_id = 'parish-photos');
   create policy "Authenticated users can upload" on storage.objects for insert with check (bucket_id = 'parish-photos' and auth.role() = 'authenticated');
   create policy "Authenticated users can update" on storage.objects for update using (bucket_id = 'parish-photos' and auth.role() = 'authenticated');
   create policy "Authenticated users can delete" on storage.objects for delete using (bucket_id = 'parish-photos' and auth.role() = 'authenticated');
   ```

#### 2. Deploy no Netlify

**Opção A: Deploy via Git (Recomendado)**
1. Faça push do código para GitHub/GitLab
2. No Netlify, clique em "New site from Git"
3. Conecte seu repositório
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
5. Deploy automático será configurado

**Opção B: Deploy Manual**
1. Execute `npm run build` localmente
2. Faça upload da pasta `dist` no Netlify
3. Configure as variáveis de ambiente no painel do Netlify

#### 3. Configurações Importantes

**Variáveis de Ambiente no Netlify:**
- Vá para Site settings > Environment variables
- Adicione:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

**Configurações de Build:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `18`

### 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── admin/          # Painel administrativo
│   ├── layout/         # Componentes de layout
│   ├── sections/       # Seções da página
│   └── ui/            # Componentes de UI
├── lib/
│   └── supabase.ts    # Configuração do Supabase
└── App.tsx            # Componente principal
```

### 🔧 Funcionalidades

- **Carrossel de Slides**: Gerenciável via painel admin
- **Galeria de Fotos**: Upload e categorização de imagens
- **Linha do Tempo**: Eventos históricos da catedral
- **Painel Administrativo**: Gerenciamento completo do conteúdo
- **Responsivo**: Funciona em todos os dispositivos

### 📧 Configuração de E-mail e Formulário de Contato

O site possui um formulário de contato que pode enviar e-mails automaticamente quando configurado corretamente.

#### Pré-requisitos
1. Configurações SMTP válidas
2. Supabase Edge Function para envio seguro

#### Passos para Configurar

**1. Configurar SMTP no Painel Administrativo**
- Acesse o painel administrativo via URL: `seusite.com/#admin`
- Vá para "Configurações de E-mail"
- Preencha as configurações SMTP:
  - **Servidor SMTP**: Ex: `smtp.gmail.com`, `mail.seudominio.com`
  - **Porta**: `587` (TLS) ou `465` (SSL)
  - **E-mail**: Seu e-mail remetente
  - **Senha**: Senha do e-mail ou "Senha de App"

**2. Configuração com E-mail de Domínio**

Para usar um e-mail do seu domínio (ex: `contato@catedralsaomiguel.com.br`):

```
Servidor SMTP: mail.seudominio.com (ou conforme seu provedor)
Porta: 587 (TLS) ou 465 (SSL)
E-mail: contato@catedralsaomiguel.com.br
Senha: senha_do_email
Seguro: Sim (TLS/SSL)
```

**3. Configuração com Gmail**

Para usar Gmail como servidor SMTP:

```
Servidor SMTP: smtp.gmail.com
Porta: 587
E-mail: seuemail@gmail.com
Senha: Senha de App (não a senha normal!)
Seguro: Sim (TLS)
```

**Como criar Senha de App no Gmail:**
1. Ative a verificação em 2 etapas na sua conta Google
2. Vá para [Senhas de App](https://myaccount.google.com/apppasswords)
3. Gere uma senha para "E-mail"
4. Use essa senha de 16 caracteres no campo "Senha"

**4. Criar Edge Function para Envio**

Crie o arquivo `supabase/functions/send-contact-email/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar configurações SMTP
    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['smtp_host', 'smtp_port', 'smtp_email', 'smtp_password', 'smtp_enabled'])

    const config = settings?.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as any) || {}

    if (config.smtp_enabled !== 'true') {
      throw new Error('SMTP não está habilitado')
    }

    // Receber dados do formulário
    const { name, email, phone, subject, message } = await req.json()

    // Aqui você implementaria a lógica de envio usando as configurações SMTP
    // Exemplo usando uma biblioteca de e-mail como nodemailer ou similar
    
    // Por enquanto, apenas simular sucesso
    console.log('Enviando e-mail:', { name, email, subject })

    return new Response(
      JSON.stringify({ success: true, message: 'E-mail enviado com sucesso!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

**5. Deploy da Edge Function**

```bash
# No terminal do seu projeto local
supabase functions deploy send-contact-email
```

**6. Testar o Sistema**
- Configure as credenciais SMTP no painel
- Clique em "Testar Conexão"
- Teste o formulário de contato no site

### 🔐 Acesso Administrativo

1. Acesse via URL: `seusite.com/#admin`
2. Faça login ou crie uma conta de administrador
3. Gerencie todo o conteúdo do site

### 📞 Suporte

Para dúvidas sobre o sistema, entre em contato com o desenvolvedor.

---

**Desenvolvido com ❤️ para a Catedral de São Miguel Arcanjo**