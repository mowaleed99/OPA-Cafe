require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecent() {
  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(3);
  console.log("Most recent orders:", orders?.map(o => ({ id: o.id, status: o.status })));
  
  const { data: closings } = await supabase.from('daily_closings').select('*').order('created_at', { ascending: false }).limit(3);
  console.log("Most recent closings:", closings?.map(c => ({ id: c.id })));
}
checkRecent().finally(() => process.exit(0));
