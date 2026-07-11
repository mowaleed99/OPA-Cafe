CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY,
    cafe_id UUID NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: cafe_id is used for multi-tenancy and should be verified via RLS if enabled.
-- ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can manage their cafe's expenses" ON expenses FOR ALL USING (cafe_id IN (SELECT cafe_id FROM app_users WHERE auth_id = auth.uid()));

-- =============================================================================
-- MISSING UPDATES FROM PREVIOUS TASKS (RBAC & Currency)
-- =============================================================================
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS cashier_permissions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'SAR';
