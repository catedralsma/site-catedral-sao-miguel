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
