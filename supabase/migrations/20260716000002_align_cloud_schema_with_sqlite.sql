-- OPA Cafe cloud/SQLite compatibility alignment.
-- Safe to run in the Supabase SQL Editor: it adds columns and backfills
-- values only; it does not delete tables or existing business data.

BEGIN;

-- Ensure every synced cloud table exposes the SQLite sync metadata used by
-- the desktop worker and the browser client.
DO $$
DECLARE
  table_name text;
  synced_tables text[] := ARRAY[
    'app_users', 'categories', 'products', 'inventory_items',
    'stock_movements', 'tables', 'orders', 'order_items', 'suppliers',
    'purchases', 'purchase_items', 'supplier_payments', 'expenses',
    'daily_closings', 'daily_closing_items', 'settings', 'order_audit_log'
  ];
BEGIN
  FOREACH table_name IN ARRAY synced_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ', table_name);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ', table_name);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT ''pending''', table_name);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS device_id TEXT', table_name);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1', table_name);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS last_modified_by TEXT', table_name);
  END LOOP;
END $$;

-- Categories / products / inventory
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS track_stock BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.inventory_items(id);

ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS stock_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold NUMERIC(12, 3) NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS cost_per_unit NUMERIC(12, 2) NOT NULL DEFAULT 0;
-- to_jsonb lets this work with either legacy (`quantity`, `min_quantity`)
-- or current cloud layouts without referencing a column that may not exist.
UPDATE public.inventory_items AS item
  SET stock_quantity = COALESCE(NULLIF(item.stock_quantity, 0), NULLIF(to_jsonb(item)->>'quantity', '')::NUMERIC, 0),
      low_stock_threshold = COALESCE(NULLIF(item.low_stock_threshold, 10), NULLIF(to_jsonb(item)->>'min_quantity', '')::NUMERIC, 10);

ALTER TABLE public.stock_movements
  ADD COLUMN IF NOT EXISTS reference_type TEXT,
  ADD COLUMN IF NOT EXISTS reference_id UUID,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Dining tables / sales
ALTER TABLE public.tables
  ADD COLUMN IF NOT EXISTS capacity INTEGER;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS user_name TEXT,
  ADD COLUMN IF NOT EXISTS discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check CHECK (status IN ('open', 'closed', 'paid', 'cancelled', 'voided'));
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IS NULL OR payment_method IN ('cash', 'card', 'instapay', 'vodafone_cash', 'other'));

-- Suppliers / purchasing
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS total_purchases NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_due NUMERIC(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS reference_number TEXT,
  ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_remaining NUMERIC(12, 2) NOT NULL DEFAULT 0;
DO $$
DECLARE
  purchase_date_type text;
BEGIN
  SELECT data_type INTO purchase_date_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'date';

  IF purchase_date_type LIKE 'timestamp%' THEN
    EXECUTE $sql$
      UPDATE public.purchases AS purchase
      SET date = COALESCE(purchase.date, purchase.created_at),
          amount_paid = COALESCE(NULLIF(purchase.amount_paid, 0), NULLIF(to_jsonb(purchase)->>'paid_amount', '')::NUMERIC, 0),
          amount_remaining = COALESCE(NULLIF(purchase.amount_remaining, 0), purchase.total_amount - COALESCE(NULLIF(purchase.amount_paid, 0), NULLIF(to_jsonb(purchase)->>'paid_amount', '')::NUMERIC, 0), 0)
    $sql$;
  ELSE
    EXECUTE $sql$
      UPDATE public.purchases AS purchase
      SET date = COALESCE(purchase.date, purchase.created_at::TEXT),
          amount_paid = COALESCE(NULLIF(purchase.amount_paid, 0), NULLIF(to_jsonb(purchase)->>'paid_amount', '')::NUMERIC, 0),
          amount_remaining = COALESCE(NULLIF(purchase.amount_remaining, 0), purchase.total_amount - COALESCE(NULLIF(purchase.amount_paid, 0), NULLIF(to_jsonb(purchase)->>'paid_amount', '')::NUMERIC, 0), 0)
    $sql$;
  END IF;
END $$;

ALTER TABLE public.purchase_items
  ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.inventory_items(id),
  ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0;
UPDATE public.purchase_items AS item
  SET unit_cost = COALESCE(NULLIF(item.unit_cost, 0), NULLIF(to_jsonb(item)->>'unit_price', '')::NUMERIC, 0);
ALTER TABLE public.purchase_items ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE public.supplier_payments
  ADD COLUMN IF NOT EXISTS cafe_id UUID,
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS reference_number TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
DO $$
DECLARE
  payment_date_type text;
BEGIN
  SELECT data_type INTO payment_date_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'supplier_payments' AND column_name = 'date';

  IF payment_date_type = 'date' THEN
    EXECUTE $sql$
      UPDATE public.supplier_payments AS payment
      SET date = COALESCE(payment.date, NULLIF(to_jsonb(payment)->>'paid_at', '')::TIMESTAMPTZ::DATE, payment.created_at::DATE)
    $sql$;
  ELSE
    EXECUTE $sql$
      UPDATE public.supplier_payments AS payment
      SET date = COALESCE(payment.date, NULLIF(to_jsonb(payment)->>'paid_at', ''), payment.created_at::TEXT)
    $sql$;
  END IF;
END $$;

-- Expenses
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS reference_number TEXT,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false;

-- Daily closing reports
ALTER TABLE public.daily_closings
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_by TEXT,
  ADD COLUMN IF NOT EXISTS cash_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instapay_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vodafone_cash_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cash_in_drawer NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expected_cash NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS difference NUMERIC(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.daily_closing_items
  ADD COLUMN IF NOT EXISTS total_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS product_name TEXT NOT NULL DEFAULT '';
UPDATE public.daily_closing_items AS item
  SET total_sales = COALESCE(NULLIF(item.total_sales, 0), NULLIF(to_jsonb(item)->>'revenue', '')::NUMERIC, 0);

-- Settings used by desktop and web views.
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS auto_backup_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_backup_frequency TEXT,
  ADD COLUMN IF NOT EXISTS auto_backup_time TEXT,
  ADD COLUMN IF NOT EXISTS last_backup_date TEXT,
  ADD COLUMN IF NOT EXISTS owner_pin_hash TEXT,
  ADD COLUMN IF NOT EXISTS default_printer TEXT,
  ADD COLUMN IF NOT EXISTS paper_size TEXT NOT NULL DEFAULT '80mm',
  ADD COLUMN IF NOT EXISTS auto_print_receipts BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS receipt_copies INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS report_default_output TEXT NOT NULL DEFAULT 'thermal',
  ADD COLUMN IF NOT EXISTS receipt_template_config TEXT;

-- Support the complete audit shape used by both existing cloud rows and
-- SQLite-created rows. Values are derived from the local JSON details field.
ALTER TABLE public.order_audit_log
  ADD COLUMN IF NOT EXISTS action_type TEXT,
  ADD COLUMN IF NOT EXISTS initiated_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS initiated_by_name TEXT,
  ADD COLUMN IF NOT EXISTS approved_by_owner_pin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS order_total NUMERIC(12, 2) NOT NULL DEFAULT 0;
UPDATE public.order_audit_log
  SET action_type = COALESCE(action_type, action),
      initiated_by_name = COALESCE(initiated_by_name, performed_by, 'Unknown User'),
      approved_by_owner_pin = COALESCE(approved_by_owner_pin, false),
      order_total = COALESCE(order_total, 0);

-- Useful indexes for the browser reads.
CREATE INDEX IF NOT EXISTS idx_inventory_items_cafe_active ON public.inventory_items (cafe_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_cafe_active ON public.orders (cafe_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_cafe_active ON public.products (cafe_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_cafe_active ON public.expenses (cafe_id) WHERE deleted_at IS NULL;

-- Ask PostgREST/Supabase to refresh its column cache immediately.
NOTIFY pgrst, 'reload schema';

COMMIT;
