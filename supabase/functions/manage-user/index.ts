import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { action, payload } = await req.json()

    if (action === 'create') {
      const { data, error } = await supabase.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
        user_metadata: { name: payload.name }
      })
      if (error) throw error
      
      await supabase.from('colaboradores').insert({
        id: data.user.id,
        nome: payload.name,
        email: payload.email,
        role: payload.role,
        departamento: payload.departamento,
        avatar_url: payload.avatar_url
      })
      
      return new Response(JSON.stringify({ id: data.user.id }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    if (action === 'update') {
      const updateData: any = {
        email: payload.email,
        user_metadata: { name: payload.name }
      }
      if (payload.password) {
        updateData.password = payload.password
      }

      const { data, error } = await supabase.auth.admin.updateUserById(
        payload.id,
        updateData
      )
      if (error) throw error
      
      await supabase.from('colaboradores').update({
        nome: payload.name,
        email: payload.email,
        role: payload.role,
        departamento: payload.departamento,
        avatar_url: payload.avatar_url
      }).eq('id', payload.id)
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    if (action === 'delete') {
      const { error } = await supabase.auth.admin.deleteUser(payload.id)
      if (error) throw error
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})
