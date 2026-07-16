-- Add capacity_unit to catalog table for flexible capacity display
ALTER TABLE public.catalog
ADD COLUMN IF NOT EXISTS capacity_unit TEXT DEFAULT 'orang';
