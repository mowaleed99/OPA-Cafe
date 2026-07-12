-- Add language column to settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' NOT NULL;

-- Reload schema cache (sometimes needed by Supabase)
NOTIFY pgrst, 'reload schema';
