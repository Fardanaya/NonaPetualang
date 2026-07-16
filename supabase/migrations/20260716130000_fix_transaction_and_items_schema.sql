-- ==========================================
-- FIX TRANSACTION_ITEMS TABLE
-- ==========================================
-- Add missing columns to transaction_items
ALTER TABLE public.transaction_items 
ADD COLUMN IF NOT EXISTS item_type TEXT CHECK (item_type IN ('catalog', 'accessory')),
ADD COLUMN IF NOT EXISTS item_id UUID,
ADD COLUMN IF NOT EXISTS rental_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS additional_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS selected_size TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS catalog_id_ref UUID REFERENCES public.catalog(id) ON DELETE SET NULL;

-- Migrate existing data from catalog_id to item_id and item_type
UPDATE public.transaction_items 
SET item_id = catalog_id, 
    item_type = 'catalog' 
WHERE catalog_id IS NOT NULL AND item_type IS NULL;

UPDATE public.transaction_items 
SET item_id = bundle_id, 
    item_type = 'bundle' 
WHERE bundle_id IS NOT NULL AND item_type IS NULL;

-- Drop old constraint
ALTER TABLE public.transaction_items DROP CONSTRAINT IF EXISTS chk_transaction_item_type;

-- Make item_id and item_type NOT NULL after migration
ALTER TABLE public.transaction_items 
ALTER COLUMN item_id SET NOT NULL,
ALTER COLUMN item_type SET NOT NULL;

-- ==========================================
-- FIX TRANSACTIONS TABLE
-- ==========================================
-- Add missing columns to transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deposit UUID REFERENCES public.payments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS dp_payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment UUID REFERENCES public.payments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sett_payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS additional_day INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
ADD COLUMN IF NOT EXISTS reject_reason TEXT,
ADD COLUMN IF NOT EXISTS settlement_reason TEXT,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Enable RLS for tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Policies for transactions (users can view their own)
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions 
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for transaction_items (users can access items of their transactions)
DROP POLICY IF EXISTS "Users can view own transaction items" ON public.transaction_items;
CREATE POLICY "Users can view own transaction items" ON public.transaction_items 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.transactions 
            WHERE transactions.id = transaction_items.transaction_id 
            AND transactions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own transaction items" ON public.transaction_items;
CREATE POLICY "Users can insert own transaction items" ON public.transaction_items 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.transactions 
            WHERE transactions.id = transaction_items.transaction_id 
            AND transactions.user_id = auth.uid()
        )
    );
