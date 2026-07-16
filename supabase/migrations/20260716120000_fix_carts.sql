-- Drop old carts table
DROP TABLE IF EXISTS public.carts CASCADE;

-- Create new carts table matching src/lib/types/schemas/cart.ts
CREATE TABLE public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('catalog', 'accessory')),
    item_id UUID NOT NULL,
    rental_days INTEGER NOT NULL DEFAULT 1,
    additional_days INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    selected_size TEXT,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Select policy: users can only see their own cart items
CREATE POLICY "Users can view own cart items" ON public.carts
    FOR SELECT USING (auth.uid() = user_id);

-- Insert policy: users can only insert their own cart items
CREATE POLICY "Users can insert own cart items" ON public.carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update policy: users can only update their own cart items
CREATE POLICY "Users can update own cart items" ON public.carts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Delete policy: users can only delete their own cart items
CREATE POLICY "Users can delete own cart items" ON public.carts
    FOR DELETE USING (auth.uid() = user_id);

-- Add update_updated_at_column trigger
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
