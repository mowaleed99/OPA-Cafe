-- Step 1: Create stock_movements table
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY,
    cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity NUMERIC(10, 2) NOT NULL,
    reason TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS to stock_movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stock movements in their cafe"
ON public.stock_movements FOR SELECT
USING (auth.uid() IN (
  SELECT id FROM public.app_users WHERE cafe_id = stock_movements.cafe_id
));

CREATE POLICY "Users can insert stock movements in their cafe"
ON public.stock_movements FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT id FROM public.app_users WHERE cafe_id = stock_movements.cafe_id
));

CREATE POLICY "Users can update stock movements in their cafe"
ON public.stock_movements FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM public.app_users WHERE cafe_id = stock_movements.cafe_id
));

-- Step 2: Add low_stock_threshold to inventory_items
ALTER TABLE public.inventory_items
ADD COLUMN IF NOT EXISTS low_stock_threshold NUMERIC(10, 2);
