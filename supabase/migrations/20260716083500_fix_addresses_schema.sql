-- Drop tabel yang lama karena kolomnya nggak sesuai sama kode Next.js
DROP TABLE IF EXISTS public.addresses CASCADE;

-- Bikin ulang sesuai dengan skema di `src/lib/types/schemas/address.ts`
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    label TEXT,
    address TEXT,
    address_details TEXT,
    receiver TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    sub_district_id INTEGER,
    province TEXT,
    city TEXT,
    district TEXT,
    sub_district TEXT,
    postal_code TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Re-enable RLS dan Trigger
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
