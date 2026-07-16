-- Enable RLS and add public policies for master data
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Categories policies
DROP POLICY IF EXISTS "Enable all access for categories" ON public.categories;
CREATE POLICY "Enable all access for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Brands policies
DROP POLICY IF EXISTS "Enable all access for brands" ON public.brands;
CREATE POLICY "Enable all access for brands" ON public.brands FOR ALL USING (true) WITH CHECK (true);
