const fs = require('fs');
const sql = `
-- Add currency to settings
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EGP';
`;
fs.appendFileSync('supabase/migrations/20240101000000_initial_schema.sql', sql);
