require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const orderId = '683b58f8-2c0b-4955-a0d8-3f3960b7ed2d';
const dailyClosingId = '7bf4fbd8-b8aa-4a0c-9e97-7bad780871c6';

async function verifySync() {
  console.log("Checking Supabase for newly created records...");
  
  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
  const { data: orderItem } = await supabase.from('order_items').select('*').eq('order_id', orderId).maybeSingle();
  
  const { data: closing } = await supabase.from('daily_closings').select('*').eq('id', dailyClosingId).maybeSingle();
  const { data: closingItem } = await supabase.from('daily_closing_items').select('*').eq('daily_closing_id', dailyClosingId).maybeSingle();
  
  console.log("Order Synced:", !!order);
  console.log("Order Item Synced:", !!orderItem);
  console.log("Daily Closing Synced:", !!closing);
  console.log("Daily Closing Item Synced:", !!closingItem);

  const allSynced = !!order && !!orderItem && !!closing && !!closingItem;
  if (allSynced) {
    console.log("SUCCESS: Parent and child records synced successfully!");
  } else {
    console.log("Pending: Records have not yet synced. Wait a moment for SyncWorker to poll.");
  }
}

verifySync().finally(() => process.exit(0));
