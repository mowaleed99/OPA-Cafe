-- Electron sync uses the signed-in user's Supabase access token. These
-- policies grant that user access only to records belonging to their cafe.
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cafe_access" ON public.expenses;
CREATE POLICY "cafe_access" ON public.expenses
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.stock_movements;
CREATE POLICY "cafe_access" ON public.stock_movements
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.order_audit_log;
CREATE POLICY "cafe_access" ON public.order_audit_log
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

-- Local purchases track inventory items, not sale products. Existing cloud
-- installations may still require the obsolete product_id and amount_remaining
-- fields, which rejects otherwise valid local purchase records.
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS amount_remaining NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reference_number TEXT;

ALTER TABLE public.purchase_items
  ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.inventory_items(id);
ALTER TABLE public.purchase_items
  ALTER COLUMN product_id DROP NOT NULL;

-- The local application calls the transaction date `date`, whereas the
-- original cloud expense table calls it `expense_date`.
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS expense_date DATE;
UPDATE public.expenses
  SET expense_date = COALESCE(expense_date, created_at::date)
  WHERE expense_date IS NULL;
ALTER TABLE public.expenses
  ALTER COLUMN expense_date SET NOT NULL;

-- Some deployed databases predate the `action` column and require
-- `action_type`. Retain it as a compatibility column while the client sends
-- both names during the transition.
ALTER TABLE public.order_audit_log
  ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE public.order_audit_log
  ADD COLUMN IF NOT EXISTS action_type TEXT;
UPDATE public.order_audit_log
  SET action_type = COALESCE(action_type, action)
  WHERE action_type IS NULL;
ALTER TABLE public.order_audit_log
  ALTER COLUMN action_type SET NOT NULL;
