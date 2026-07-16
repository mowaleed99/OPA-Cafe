-- =============================================================================
-- OPA Cafe — Fix missing tables and columns for sync
-- Run in: Supabase SQL Editor
-- Safe to re-run (all statements are idempotent).
-- =============================================================================

BEGIN;

-- -------------------------------------------------------------------------
-- 1. Create tables that were never in the initial schema but are referenced
--    by the sync worker and previous ALTER TABLE migrations.
-- -------------------------------------------------------------------------

-- daily_closings
CREATE TABLE IF NOT EXISTS public.daily_closings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id          UUID NOT NULL,
  closing_date     TEXT NOT NULL,
  closed_at        TIMESTAMPTZ,
  closed_by        TEXT,
  total_orders     INTEGER NOT NULL DEFAULT 0,
  total_sales      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cash_sales       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  instapay_sales   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  vodafone_cash_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_expenses   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cash_in_drawer   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  expected_cash    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  difference       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- daily_closing_items
CREATE TABLE IF NOT EXISTS public.daily_closing_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_closing_id  UUID NOT NULL REFERENCES public.daily_closings(id) ON DELETE CASCADE,
  product_id        UUID,
  quantity_sold     INTEGER NOT NULL DEFAULT 0,
  total_sales       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  category_name     TEXT NOT NULL DEFAULT '',
  product_name      TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- settings
CREATE TABLE IF NOT EXISTS public.settings (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id                  UUID NOT NULL,
  language                 TEXT,
  cafe_name                TEXT,
  currency                 TEXT,
  print_paper_size         TEXT,
  cashier_permissions      TEXT,
  auto_backup_enabled      BOOLEAN NOT NULL DEFAULT false,
  auto_backup_frequency    TEXT,
  auto_backup_time         TEXT,
  last_backup_date         TEXT,
  owner_pin_hash           TEXT,
  default_printer          TEXT,
  paper_size               TEXT NOT NULL DEFAULT '80mm',
  auto_print_receipts      BOOLEAN NOT NULL DEFAULT false,
  receipt_copies           INTEGER NOT NULL DEFAULT 1,
  report_default_output    TEXT NOT NULL DEFAULT 'thermal',
  receipt_template_config  TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------------
-- 2. Add any columns that previous ALTER TABLE migrations may have missed
--    or that exist in the initial schema but PostgREST cache doesn't see.
-- -------------------------------------------------------------------------

-- daily_closings: add notes if table existed without it
ALTER TABLE public.daily_closings
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- tables: ensure created_at is visible (it's in the initial schema but
-- PostgREST may not have it cached after adding many columns)
ALTER TABLE public.tables
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- suppliers: phone exists in initial schema, but ensure it's present
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- -------------------------------------------------------------------------
-- 3. Re-run the sync metadata columns for the newly created tables.
-- -------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  tables_to_fix text[] := ARRAY[
    'daily_closings', 'daily_closing_items', 'settings'
  ];
BEGIN
  FOREACH t IN ARRAY tables_to_fix LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT ''pending''', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS device_id TEXT', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS last_modified_by TEXT', t);
  END LOOP;
END $$;

-- -------------------------------------------------------------------------
-- 4. Enable RLS and add the same permissive policy used by all other tables.
-- -------------------------------------------------------------------------
ALTER TABLE public.daily_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_closing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
  tables_to_fix text[] := ARRAY[
    'daily_closings', 'daily_closing_items', 'settings'
  ];
BEGIN
  FOREACH t IN ARRAY tables_to_fix LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users full access" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "Authenticated users full access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;

-- -------------------------------------------------------------------------
-- 5. Force PostgREST to refresh its schema cache.
-- -------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

COMMIT;
