-- Add inventory item columns for counting and minimum stock
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS is_countable BOOLEAN DEFAULT false;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS pieces_per_carton INTEGER;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS minimum_stock INTEGER;
