-- =============================================================================
-- OPA Cafe — Complete Transactional Data Reset
-- =============================================================================
-- This script safely deletes all transactional data created during development
-- and testing, while preserving the schema, authentication, users, products, 
-- categories, tables, inventory items, suppliers, and settings.
-- =============================================================================

BEGIN;

-- 1. Unlink current orders from dining tables to prevent foreign key issues
UPDATE public.tables SET current_order_id = NULL, status = 'available';

-- 2. Clear Sync Queue and Conflicts (if they exist in Supabase, although usually local)
-- (No-op if these tables don't exist in Supabase, but added just in case)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sync_queue') THEN
    EXECUTE 'DELETE FROM public.sync_queue';
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sync_conflicts') THEN
    EXECUTE 'DELETE FROM public.sync_conflicts';
  END IF;
END $$;

-- 3. Delete Sales and Order Data (Children first)
DELETE FROM public.order_audit_log;
DELETE FROM public.daily_closing_items;
DELETE FROM public.daily_closings;
DELETE FROM public.order_items;
DELETE FROM public.orders;

-- 4. Delete Inventory and Purchase Transactions (Children first)
DELETE FROM public.stock_movements;
DELETE FROM public.purchase_items;
DELETE FROM public.supplier_payments;
DELETE FROM public.purchases;
DELETE FROM public.expenses;

-- 5. Reset Aggregate Columns (Optional but recommended for a clean slate)
-- Reset inventory stock to 0
DO $$ 
BEGIN
  IF EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='stock_quantity') THEN
    EXECUTE 'UPDATE public.inventory_items SET stock_quantity = 0';
  ELSE
    -- Fallback in case old schema is used
    EXECUTE 'UPDATE public.inventory_items SET quantity = 0';
  END IF;
END $$;

-- Reset supplier balances
DO $$ 
BEGIN
  IF EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='suppliers' AND column_name='total_purchases') THEN
    EXECUTE 'UPDATE public.suppliers SET total_purchases = 0, total_paid = 0, total_due = 0';
  END IF;
END $$;

COMMIT;

-- =============================================================================
-- Verification:
-- After running this, check that the tables above are empty.
-- =============================================================================
