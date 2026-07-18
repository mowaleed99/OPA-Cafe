require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchValidData() {
  const { data: user } = await supabase.from('app_users').select('cafe_id').limit(1).single();
  const { data: product } = await supabase.from('products').select('id').limit(1).single();
  
  console.log("Supabase Cafe ID:", user?.cafe_id);
  console.log("Supabase Product ID:", product?.id);
}

fetchValidData().finally(() => process.exit(0));
