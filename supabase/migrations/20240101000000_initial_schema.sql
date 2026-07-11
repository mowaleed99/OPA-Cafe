-- =============================================================================
-- OPA Cafe — Initial Schema (idempotent — safe to re-run)
-- Apply via: paste into Supabase SQL editor and run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- TABLES (all idempotent)
-- ---------------------------------------------------------------------------

-- app_users: one row per authenticated user (owner or cashier)
CREATE TABLE IF NOT EXISTS public.app_users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_id     UUID NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'cashier')),
  name        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add name and email columns if the table already existed without it
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS email TEXT;

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id     UUID NOT NULL,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- products
CREATE TABLE IF NOT EXISTS public.products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id      UUID NOT NULL,
  category_id  UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  price        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  image_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- inventory_items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id        UUID NOT NULL,
  name           TEXT NOT NULL,
  quantity       NUMERIC NOT NULL DEFAULT 0,
  unit           TEXT,
  min_quantity   NUMERIC NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- tables (maps to local Dexie dining_tables)
CREATE TABLE IF NOT EXISTS public.tables (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id           UUID NOT NULL,
  name_or_number    TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
  current_order_id  UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- orders
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id         UUID NOT NULL,
  table_id        UUID REFERENCES public.tables(id) ON DELETE SET NULL,
  order_type      TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway')),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'cancelled')),
  payment_method  TEXT CHECK (payment_method IN ('cash', 'card', 'other')),
  total_amount    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add payment_method column if the table already existed without it
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity    INT NOT NULL DEFAULT 1,
  unit_price  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal    NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id     UUID NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- purchases
CREATE TABLE IF NOT EXISTS public.purchases (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id         UUID NOT NULL,
  supplier_id     UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  total_amount    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  paid_amount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_status  TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- purchase_items
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id  UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL,
  item_name    TEXT,
  quantity     NUMERIC NOT NULL DEFAULT 1,
  unit_price   NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal     NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Add item_name column if the table already existed without it
ALTER TABLE public.purchase_items ADD COLUMN IF NOT EXISTS item_name TEXT;

-- supplier_payments
CREATE TABLE IF NOT EXISTS public.supplier_payments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id  UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  supplier_id  UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  amount       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  paid_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes        TEXT
);

-- daily_closings
CREATE TABLE IF NOT EXISTS public.daily_closings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id       UUID NOT NULL,
  closing_date  DATE NOT NULL,
  total_sales   NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_orders  INT NOT NULL DEFAULT 0,
  total_expenses NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- daily_closing_items
CREATE TABLE IF NOT EXISTS public.daily_closing_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_closing_id UUID NOT NULL REFERENCES public.daily_closings(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity_sold    INT NOT NULL DEFAULT 0,
  revenue          NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- settings (one row per cafe)
CREATE TABLE IF NOT EXISTS public.settings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id          UUID NOT NULL UNIQUE,
  cafe_name        TEXT,
  language         TEXT NOT NULL DEFAULT 'ar',
  print_paper_size TEXT NOT NULL DEFAULT '80mm',
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- INDEXES (all idempotent)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_categories_cafe_id     ON public.categories(cafe_id);
CREATE INDEX IF NOT EXISTS idx_products_cafe_id       ON public.products(cafe_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id   ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_cafe   ON public.inventory_items(cafe_id);
CREATE INDEX IF NOT EXISTS idx_tables_cafe_id         ON public.tables(cafe_id);
CREATE INDEX IF NOT EXISTS idx_orders_cafe_id         ON public.orders(cafe_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id        ON public.orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status          ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_cafe_id      ON public.suppliers(cafe_id);
CREATE INDEX IF NOT EXISTS idx_purchases_cafe_id      ON public.purchases(cafe_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_pid     ON public.purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_sid  ON public.supplier_payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_daily_closings_cafe    ON public.daily_closings(cafe_id);
CREATE INDEX IF NOT EXISTS idx_daily_closings_date    ON public.daily_closings(closing_date);
CREATE INDEX IF NOT EXISTS idx_daily_closing_items    ON public.daily_closing_items(daily_closing_id);
CREATE INDEX IF NOT EXISTS idx_app_users_cafe_id      ON public.app_users(cafe_id);

-- ---------------------------------------------------------------------------
-- ROW-LEVEL SECURITY
-- ---------------------------------------------------------------------------
ALTER TABLE public.app_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_closings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_closing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings           ENABLE ROW LEVEL SECURITY;

-- Helper: get the cafe_id for the currently authenticated user
CREATE OR REPLACE FUNCTION public.my_cafe_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT cafe_id FROM public.app_users WHERE id = auth.uid() LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- RLS POLICIES (idempotent via DROP and re-CREATE)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users see their cafe" ON public.app_users;
CREATE POLICY "Users see their cafe" ON public.app_users
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.categories;
CREATE POLICY "cafe_access" ON public.categories
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.products;
CREATE POLICY "cafe_access" ON public.products
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.inventory_items;
CREATE POLICY "cafe_access" ON public.inventory_items
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.tables;
CREATE POLICY "cafe_access" ON public.tables
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.orders;
CREATE POLICY "cafe_access" ON public.orders
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.suppliers;
CREATE POLICY "cafe_access" ON public.suppliers
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.purchases;
CREATE POLICY "cafe_access" ON public.purchases
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.daily_closings;
CREATE POLICY "cafe_access" ON public.daily_closings
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.settings;
CREATE POLICY "cafe_access" ON public.settings
  FOR ALL USING (cafe_id = public.my_cafe_id()) WITH CHECK (cafe_id = public.my_cafe_id());

DROP POLICY IF EXISTS "cafe_access" ON public.order_items;
CREATE POLICY "cafe_access" ON public.order_items
  FOR ALL USING (
    order_id IN (SELECT id FROM public.orders WHERE cafe_id = public.my_cafe_id())
  ) WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE cafe_id = public.my_cafe_id())
  );

DROP POLICY IF EXISTS "cafe_access" ON public.purchase_items;
CREATE POLICY "cafe_access" ON public.purchase_items
  FOR ALL USING (
    purchase_id IN (SELECT id FROM public.purchases WHERE cafe_id = public.my_cafe_id())
  ) WITH CHECK (
    purchase_id IN (SELECT id FROM public.purchases WHERE cafe_id = public.my_cafe_id())
  );

DROP POLICY IF EXISTS "cafe_access" ON public.supplier_payments;
CREATE POLICY "cafe_access" ON public.supplier_payments
  FOR ALL USING (
    supplier_id IN (SELECT id FROM public.suppliers WHERE cafe_id = public.my_cafe_id())
  ) WITH CHECK (
    supplier_id IN (SELECT id FROM public.suppliers WHERE cafe_id = public.my_cafe_id())
  );

DROP POLICY IF EXISTS "cafe_access" ON public.daily_closing_items;
CREATE POLICY "cafe_access" ON public.daily_closing_items
  FOR ALL USING (
    daily_closing_id IN (SELECT id FROM public.daily_closings WHERE cafe_id = public.my_cafe_id())
  ) WITH CHECK (
    daily_closing_id IN (SELECT id FROM public.daily_closings WHERE cafe_id = public.my_cafe_id())
  );

-- Fix for payment_method check constraint to match local PaymentMethod enum
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('cash', 'instapay', 'vodafone_cash', 'card', 'other'));

-- ---------------------------------------------------------------------------
-- REALTIME (idempotent via DO blocks)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.suppliers;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.purchases;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_items;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.supplier_payments;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_closings;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_closing_items;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

- -   A d d   t o t a l _ e x p e n s e s   t o   d a i l y _ c l o s i n g s  
 A L T E R   T A B L E   p u b l i c . d a i l y _ c l o s i n g s   A D D   C O L U M N   I F   N O T   E X I S T S   t o t a l _ e x p e n s e s   N U M E R I C ( 1 0 ,   2 )   N O T   N U L L   D E F A U L T   0 ;  
 

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


DO  BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;
EXCEPTION WHEN duplicate_object THEN NULL; END ;

-- Add currency to settings
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EGP';
