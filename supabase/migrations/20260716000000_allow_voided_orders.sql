-- The desktop application records a void/refund with status = 'voided'.
-- The original cloud constraint omitted this valid application state, causing
-- every void/refund order update to remain in the local sync queue.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('open', 'paid', 'cancelled', 'voided'));
