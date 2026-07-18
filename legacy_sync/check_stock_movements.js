import { supabase } from './src/infrastructure/api/supabase.js';

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
