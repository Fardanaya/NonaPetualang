-- ==========================================
-- ADD PRICE COLUMN TO TRANSACTION_ITEMS
-- ==========================================
-- The code inserts 'price' (total price per item) but the original schema
-- only had 'price_per_day' and 'total_price'. This migration adds the
-- 'price' column that the application code expects.

ALTER TABLE public.transaction_items
ADD COLUMN IF NOT EXISTS price DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Also ensure quantity column exists (used in some places)
ALTER TABLE public.transaction_items
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
