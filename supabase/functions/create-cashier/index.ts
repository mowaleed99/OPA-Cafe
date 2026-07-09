import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, name, cafe_id } = await req.json()

    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verify that the caller is an owner (Optional, but good for security)
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Create a Supabase Admin Client using the SERVICE_ROLE_KEY
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Double check that the calling user is an owner of the cafe_id
    const { data: ownerCheck } = await supabaseAdmin
      .from('app_users')
      .select('role')
      .eq('id', user.id)
      .eq('cafe_id', cafe_id)
      .single()

    if (!ownerCheck || ownerCheck.role !== 'owner') {
      throw new Error('Not authorized to create cashiers for this cafe')
    }

    // CREATE THE CASHIER USER with auto-confirm
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) throw authError

    // INSERT INTO app_users
    const { error: dbError } = await supabaseAdmin.from('app_users').insert({
      id: newAuthUser.user.id,
      cafe_id: cafe_id,
      role: 'cashier',
      name: name ?? null,
    })

    if (dbError) {
      // rollback if possible
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id)
      throw dbError
    }

    return new Response(JSON.stringify({ success: true, user: newAuthUser.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
