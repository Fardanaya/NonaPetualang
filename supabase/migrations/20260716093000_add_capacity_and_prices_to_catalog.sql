-- Add capacity and dynamic prices to catalog table
ALTER TABLE public.catalog
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '[]'::jsonb;
