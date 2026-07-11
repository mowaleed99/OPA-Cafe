import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStockMovements() {
  const { data, error } = await supabase
    .from('stock_movements')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Error fetching stock_movements:', error.message);
  } else {
    console.log('stock_movements table exists and is accessible. Data:', data);
  }
}

checkStockMovements();
