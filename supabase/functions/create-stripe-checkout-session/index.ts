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

    // Buscar configurações do Stripe
    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', [
        'stripe_secret_key',
        'stripe_enabled',
        'stripe_currency',
        'stripe_minimum_amount',
        'stripe_success_url',
        'stripe_cancel_url',
        'stripe_company_name'
      ]);

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

    // Receber dados da requisição
    const { amount, donor_name, donor_email, donor_phone, donation_purpose, message } = await req.json();

    // Validar valor mínimo
    const minimumAmount = parseFloat(config.stripe_minimum_amount || '10');
    if (amount < minimumAmount) {
      throw new Error(`Valor mínimo para doação: R$ ${minimumAmount}`);
    }

    // Criar sessão de checkout no Stripe
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.stripe_secret_key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': config.stripe_currency || 'brl',
        'line_items[0][price_data][product_data][name]': 'Doação para Capela São Miguel',
        'line_items[0][price_data][product_data][description]': donation_purpose || 'Doação espontânea',
        'line_items[0][price_data][unit_amount]': (amount * 100).toString(), // Stripe usa centavos
        'line_items[0][quantity]': '1',
        'success_url': `${req.headers.get('origin')}${config.stripe_success_url || '/capela?donation=success'}&session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${req.headers.get('origin')}${config.stripe_cancel_url || '/capela?donation=cancelled'}`,
        'customer_email': donor_email || '',
        'metadata[donor_name]': donor_name || '',
        'metadata[donor_phone]': donor_phone || '',
        'metadata[donation_purpose]': donation_purpose || '',
        'metadata[message]': message || '',
        'metadata[source]': 'capela_website'
      }),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      throw new Error(errorData.error?.message || 'Erro ao criar sessão de pagamento');
    }

    const session = await stripeResponse.json();

    // Salvar doação pendente no banco
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert([{
        stripe_session_id: session.id,
        amount: amount,
        currency: config.stripe_currency || 'BRL',
        status: 'pending',
        donor_name: donor_name || null,
        donor_email: donor_email || null,
        donor_phone: donor_phone || null,
        donation_purpose: donation_purpose || null,
        message: message || null,
        metadata: {
          stripe_session_url: session.url,
          created_from: 'capela_website'
        }
      }])
      .select()
      .single();

    if (donationError) {
      console.error('Error saving donation:', donationError);
      // Não falhar a requisição por causa disso
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: session.url,
        session_id: session.id
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
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