import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdmin() {
  const userId = 'a17204f6-c795-40a1-b73d-d46d8b48f728';

  // Get cafe
  const { data: cafes } = await supabase.from('cafes').select('*').eq('name', 'OPA CAFE').limit(1);
  const cafeId = cafes?.[0]?.id;

  if (!cafeId) {
    console.error('Cafe not found');
    return;
  }

  console.log('Inserting app_user profile...', cafeId);
  const { error: userError } = await supabase.from('app_users').upsert({
    id: userId,
    cafe_id: cafeId,
    role: 'owner',
  });

  if (userError) {
    console.error('Error creating app_user:', userError);
    return;
  }

  console.log('Admin setup complete!');
}

fixAdmin();
