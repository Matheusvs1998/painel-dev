import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Ignora chamadas de pre-flight do navegador (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Pega o tipo do evento que o GitHub mandou no Header
    const eventType = req.headers.get('x-github-event') || 'unknown';
    
    // 2. Transforma o payload em JSON
    const payload = await req.json();

    // 3. Extrai apenas o que importa (Ação, Usuário e Repositório)
    const action = payload.action || '';
    const sender = payload.sender ? payload.sender.login : 'unknown';
    const repo = payload.repository ? payload.repository.full_name : 'unknown';

    console.log(`[GitHub Webhook] Recebido ${eventType} de ${sender} no repositório ${repo}`);

    // 4. Cria o cliente do Supabase usando as variáveis de ambiente que a função já injeta automaticamente
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 5. Salva no banco de dados na tabela "github_events"
    const { data, error } = await supabaseClient
      .from('github_events')
      .insert([
        { 
          event_type: eventType, 
          action: action, 
          sender: sender, 
          repo: repo 
        }
      ]);

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Webhook processado e salvo no banco com sucesso!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    console.error("Erro na Edge Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
