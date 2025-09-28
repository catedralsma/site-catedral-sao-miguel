import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar chave secreta do Stripe
    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['stripe_secret_key', 'stripe_enabled']);

    const config = settings?.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as any) || {};

    if (config.stripe_enabled !== 'true') {
      throw new Error('Stripe não está habilitado');
    }

    if (!config.stripe_secret_key) {
      throw new Error('Chave secreta do Stripe não configurada');
    }

    // Testar conexão com a API do Stripe
    const stripeResponse = await fetch('https://api.stripe.com/v1/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.stripe_secret_key}`,
      },
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      throw new Error(errorData.error?.message || 'Erro na conexão com Stripe');
    }

    const balanceData = await stripeResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Conexão com Stripe estabelecida com sucesso',
        currency: balanceData.available?.[0]?.currency || 'N/A'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error testing Stripe connection:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      }
    );
  }
});