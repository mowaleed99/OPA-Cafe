-- Create order_audit_log table if missing
CREATE TABLE IF NOT EXISTS public.order_audit_log (
    id UUID PRIMARY KEY,
    cafe_id UUID NOT NULL,
    order_id UUID NOT NULL,
    action TEXT NOT NULL,
    performed_by TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    reason TEXT,
    details JSONB
);

-- Loop to add sync fields to all tables synced by syncWorker
DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY[
    'app_users', 'categories', 'products', 'inventory_items', 
    'stock_movements', 'tables', 'orders', 'order_items', 
    'suppliers', 'purchases', 'purchase_items', 'supplier_payments', 
    'expenses', 'daily_closings', 'daily_closing_items', 
    'settings', 'order_audit_log'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT ''pending'';', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS device_id TEXT;', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS last_modified_by TEXT;', t);
  END LOOP;
END $$;
