-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone_whatsapp TEXT,
    identity_pict TEXT,
    is_blacklist BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. CATEGORIES & BRANDS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. CATALOG
-- ==========================================
CREATE TABLE IF NOT EXISTS public.catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    total_stock INTEGER NOT NULL DEFAULT 0,
    available_stock INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. TAGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Relasi Many-to-Many antara Catalog dan Tags
CREATE TABLE IF NOT EXISTS public.catalog_tags (
    catalog_id UUID REFERENCES public.catalog(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (catalog_id, tag_id)
);

-- ==========================================
-- 5. BUNDLES & BUNDLE ITEMS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bundle_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID REFERENCES public.bundles(id) ON DELETE CASCADE,
    catalog_id UUID REFERENCES public.catalog(id) ON DELETE CASCADE,
    qty INTEGER NOT NULL DEFAULT 1
);

-- ==========================================
-- 6. ITEM UNITS & LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.item_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID REFERENCES public.catalog(id) ON DELETE CASCADE,
    unit_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'available',
    condition TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.item_unit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES public.item_units(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    previous_status TEXT,
    new_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 7. CARTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    catalog_id UUID REFERENCES public.catalog(id) ON DELETE CASCADE,
    bundle_id UUID REFERENCES public.bundles(id) ON DELETE CASCADE,
    rental_days INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Validasi: Cart item hanya boleh berupa catalog_id ATAU bundle_id, tidak keduanya
    CONSTRAINT chk_cart_item_type CHECK (
        (catalog_id IS NOT NULL AND bundle_id IS NULL) OR 
        (catalog_id IS NULL AND bundle_id IS NOT NULL)
    )
);

-- ==========================================
-- 8. TRANSACTIONS & ITEMS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    start_rent DATE NOT NULL,
    end_rent DATE NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    final_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    catalog_id UUID REFERENCES public.catalog(id) ON DELETE SET NULL,
    bundle_id UUID REFERENCES public.bundles(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES public.item_units(id) ON DELETE SET NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    
    -- Validasi tipe item (catalog atau bundle)
    CONSTRAINT chk_transaction_item_type CHECK (
        (catalog_id IS NOT NULL AND bundle_id IS NULL) OR 
        (catalog_id IS NULL AND bundle_id IS NOT NULL)
    )
);

-- ==========================================
-- 9. PAYMENTS & PENALTIES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    nominal DECIMAL(12,2) NOT NULL,
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- TRIGGERS (Auto update updated_at)
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_catalog_updated_at BEFORE UPDATE ON public.catalog FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bundles_updated_at BEFORE UPDATE ON public.bundles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_item_units_updated_at BEFORE UPDATE ON public.item_units FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_penalties_updated_at BEFORE UPDATE ON public.penalties FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
