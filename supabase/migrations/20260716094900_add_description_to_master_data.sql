-- Add description to categories and brands
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon_url TEXT;

ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;
