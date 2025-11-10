// Supabase Edge Function para deletar usuário
// Deploy: supabase functions deploy delete-user

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase com privilégios de service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Obter userId do body
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Deletando usuário:', userId)

    // 1. Deletar validações do usuário
    const { error: validationsError } = await supabaseAdmin
      .from('validations')
      .delete()
      .eq('user_id', userId)

    if (validationsError) {
      console.error('Erro ao deletar validações:', validationsError)
    } else {
      console.log('Validações deletadas com sucesso')
    }

    // 2. Deletar avatar do storage (se existir)
    try {
      const { data: avatarFiles } = await supabaseAdmin.storage
        .from('avatars')
        .list(userId)

      if (avatarFiles && avatarFiles.length > 0) {
        const filesToDelete = avatarFiles.map(file => `${userId}/${file.name}`)
        await supabaseAdmin.storage
          .from('avatars')
          .remove(filesToDelete)
        console.log('Avatars deletados com sucesso')
      }
    } catch (storageError) {
      console.error('Erro ao deletar avatars:', storageError)
    }

    // 3. Deletar usuário do Supabase Auth (requer service_role)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    )

    if (deleteUserError) {
      console.error('Erro ao deletar usuário:', deleteUserError)
      return new Response(
        JSON.stringify({ error: deleteUserError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Usuário deletado com sucesso')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário deletado com sucesso' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
