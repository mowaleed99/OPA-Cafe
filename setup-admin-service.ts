import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxkomglqrwqjqehlqqlj.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a29tZ2xxcndxanFlaGxxcWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM2ODE5MywiZXhwIjoyMDk4OTQ0MTkzfQ.Mfd-Lpuoj1ePNJP9qOaYez8Lkb4ZCiquPZJTazKPNFw';
const supabase = createClient(supabaseUrl, serviceKey);

async function setupAdmin() {
  const email = 'Ebrahimnagy2026@opa.com';
  const password = 'nagy@Ebrahim2026';

  console.log('Finding existing user...');
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const existingUser = users.find(u => u.email === email.toLowerCase());

  if (existingUser) {
    console.log('Deleting existing unconfirmed user:', existingUser.id);
    await supabase.auth.admin.deleteUser(existingUser.id);
    await supabase.from('app_users').delete().eq('id', existingUser.id);
  }

  console.log('Creating auto-confirmed Admin user...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    console.error('Error creating user:', authError);
    return;
  }

  const userId = authData.user.id;
  console.log('User created:', userId);

  // Check if cafe exists or create it
  console.log('Linking to OPA CAFE...');
  const { data: cafes } = await supabase.from('cafes').select('*').eq('name', 'OPA CAFE').limit(1);
  let cafeId = cafes?.[0]?.id;

  if (!cafeId) {
    cafeId = crypto.randomUUID();
    await supabase.from('cafes').insert({ id: cafeId, name: 'OPA CAFE' });
  }

  console.log('Creating app_user profile...');
  const { error: userError } = await supabase.from('app_users').upsert({
    id: userId,
    cafe_id: cafeId,
    role: 'owner',
  });

  if (userError) {
    console.error('Error creating app_user:', userError);
    return;
  }

  console.log('✅ Admin setup complete! You can now log in.');
}

setupAdmin();
