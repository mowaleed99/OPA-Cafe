-- add_missing_sync_columns.sql
-- Adds missing columns to Supabase tables to match the local SQLite schema and prevent sync errors

ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS local_password_hash TEXT;

ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS auto_backup_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_backup_frequency TEXT,
ADD COLUMN IF NOT EXISTS auto_backup_time TEXT,
ADD COLUMN IF NOT EXISTS last_backup_date TEXT,
ADD COLUMN IF NOT EXISTS owner_pin_hash TEXT,
ADD COLUMN IF NOT EXISTS default_printer TEXT,
ADD COLUMN IF NOT EXISTS paper_size TEXT DEFAULT '80mm',
ADD COLUMN IF NOT EXISTS auto_print_receipts BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS receipt_copies INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS report_default_output TEXT DEFAULT 'thermal',
ADD COLUMN IF NOT EXISTS receipt_template_config TEXT;
