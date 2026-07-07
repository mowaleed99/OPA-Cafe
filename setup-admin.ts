import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  const email = 'Ebrahimnagy2026@opa.com';
  const password = 'nagy@2026';
  
  console.log('Signing up admin...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Sign up error:', authError);
    return;
  }

  const userId = authData.user?.id;
  if (!userId) {
    console.error('No user ID returned');
    return;
  }

  console.log('User created:', userId);

  // Check if cafe exists or create it
  const cafeId = crypto.randomUUID();
  console.log('Creating cafe OPA CAFE...');
  const { error: cafeError } = await supabase.from('cafes').insert({
    id: cafeId,
    name: 'OPA CAFE'
  });

  if (cafeError) {
    console.error('Error creating cafe:', cafeError);
    return;
  }

  console.log('Creating app_user profile...');
  const { error: userError } = await supabase.from('app_users').insert({
    id: userId,
    cafe_id: cafeId,
    role: 'owner',
    email: email
  });

  if (userError) {
    console.error('Error creating app_user:', userError);
    return;
  }

  console.log('Admin setup complete!');
}

setupAdmin();
