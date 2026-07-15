-- Ensure cafes table exists in case it is missing from previous migrations
CREATE TABLE IF NOT EXISTS public.cafes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert the default cafe_id used by the local app's offline bootstrap process
INSERT INTO public.cafes (id, name)
VALUES ('00000000-0000-0000-0000-000000000000', 'Local Offline Cafe')
ON CONFLICT (id) DO NOTHING;
