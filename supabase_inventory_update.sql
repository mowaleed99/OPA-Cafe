-- Step 1: Update products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS track_stock BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.inventory_items(id);

-- Step 2: Update inventory_items table
ALTER TABLE public.inventory_items
ADD COLUMN IF NOT EXISTS is_countable BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pieces_per_carton INTEGER,
ADD COLUMN IF NOT EXISTS minimum_stock INTEGER;
