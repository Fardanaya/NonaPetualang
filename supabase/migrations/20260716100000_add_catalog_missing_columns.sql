-- Add missing catalog columns for Nona Petualang
ALTER TABLE public.catalog
ADD COLUMN IF NOT EXISTS catalog_type TEXT DEFAULT 'alat',
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
