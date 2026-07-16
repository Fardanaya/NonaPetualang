-- Enable RLS and add public policies for catalog table and related tables
ALTER TABLE public.catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Catalog policies
DROP POLICY IF EXISTS "Enable all access for catalog" ON public.catalog;
CREATE POLICY "Enable all access for catalog" ON public.catalog FOR ALL USING (true) WITH CHECK (true);

-- Bundles policies
DROP POLICY IF EXISTS "Enable all access for bundles" ON public.bundles;
CREATE POLICY "Enable all access for bundles" ON public.bundles FOR ALL USING (true) WITH CHECK (true);

-- Bundle Items policies
DROP POLICY IF EXISTS "Enable all access for bundle_items" ON public.bundle_items;
CREATE POLICY "Enable all access for bundle_items" ON public.bundle_items FOR ALL USING (true) WITH CHECK (true);

-- Catalog Tags policies
DROP POLICY IF EXISTS "Enable all access for catalog_tags" ON public.catalog_tags;
CREATE POLICY "Enable all access for catalog_tags" ON public.catalog_tags FOR ALL USING (true) WITH CHECK (true);

-- Tags policies
DROP POLICY IF EXISTS "Enable all access for tags" ON public.tags;
CREATE POLICY "Enable all access for tags" ON public.tags FOR ALL USING (true) WITH CHECK (true);
