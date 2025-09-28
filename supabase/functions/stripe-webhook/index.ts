import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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
      .in('key', ['stripe_webhook_secret', 'stripe_enabled']);

    const config = settings?.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as any) || {};

    if (config.stripe_enabled !== 'true') {
      throw new Error('Stripe não está habilitado');
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Assinatura do webhook não encontrada');
    }

    const body = await req.text();
    
    // Verificar assinatura do webhook (simplificado para este exemplo)
    // Em produção, você deve usar a biblioteca oficial do Stripe para verificar a assinatura
    
    const event = JSON.parse(body);
    
    console.log('Webhook event received:', event.type);

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabase, event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(supabase, event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
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

async function handleCheckoutCompleted(supabase: any, session: any) {
  try {
    const { error } = await supabase
      .from('donations')
      .update({
        stripe_payment_intent_id: session.payment_intent,
        status: 'processing',
        metadata: {
          ...session.metadata,
          checkout_completed_at: new Date().toISOString()
        }
      })
      .eq('stripe_session_id', session.id);

    if (error) {
      console.error('Error updating donation after checkout:', error);
    }
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
  }
}

async function handlePaymentSucceeded(supabase: any, paymentIntent: any) {
  try {
    const { error } = await supabase
      .from('donations')
      .update({
        status: 'completed',
        metadata: {
          payment_succeeded_at: new Date().toISOString(),
          stripe_payment_method: paymentIntent.payment_method
        }
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Error updating donation after payment success:', error);
    }
  } catch (error) {
    console.error('Error in handlePaymentSucceeded:', error);
  }
}

async function handlePaymentFailed(supabase: any, paymentIntent: any) {
  try {
    const { error } = await supabase
      .from('donations')
      .update({
        status: 'failed',
        metadata: {
          payment_failed_at: new Date().toISOString(),
          failure_reason: paymentIntent.last_payment_error?.message || 'Unknown error'
        }
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Error updating donation after payment failure:', error);
    }
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error);
  }
}