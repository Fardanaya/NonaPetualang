"use server";

import { createClient } from '@/lib/supabase/server';
import { catalogSchema } from "../types/schemas/catalog";

// Helper function to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export const createOrUpdate = async (model: any) => {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient();

        // Validate the model against the schema
        const validatedData = catalogSchema.parse(model);

        // Generate slug if not provided
        let slug = validatedData.slug;
        if (!slug && validatedData.name) {
            slug = generateSlug(validatedData.name);

            // Check if slug already exists
            const { data: existingCatalog } = await supabase
                .from('catalog')
                .select('id')
                .eq('slug', slug)
                .neq('id', validatedData.id || '')
                .single();

            // If slug exists, append counter
            if (existingCatalog) {
                let counter = 1;
                let newSlug = slug;
                while (existingCatalog) {
                    newSlug = `${slug}-${counter}`;
                    const { data: checkCatalog } = await supabase
                        .from('catalog')
                        .select('id')
                        .eq('slug', newSlug)
                        .neq('id', validatedData.id || '')
                        .single();
                    if (!checkCatalog) break;
                    counter++;
                }
                slug = newSlug;
            }
        }

        // Prepare the data for Supabase
        const dataToSave = {
            ...validatedData,
            slug,
            // Handle nested objects for Supabase
            brand_id: validatedData.brand_id?.id || null,
            category_id: validatedData.category_id?.id || null,
            // Remove bundle_catalog and tags from main catalog data as they're handled separately
            bundle_catalog: undefined,
            tags: undefined
        };

        // Create or update the main catalog
        const { data: result, error } = await supabase
            .from('catalog')
            .upsert(dataToSave as any)
            .select()
            .single();

        if (error) throw error;

        // Handle bundle items if this is a bundle
        if (validatedData.catalog_type === 'bundle' && validatedData.bundle_catalog) {
            // First, delete existing bundle items
            await supabase
                .from('bundle_items')
                .delete()
                .eq('bundle_id', (result as any).id);

            // Then insert new bundle items
            const bundleItems = validatedData.bundle_catalog
                .filter((catalogId: string) => catalogId.trim() !== '')
                .map((catalogId: string) => ({
                    bundle_id: (result as any).id,
                    costume_id: catalogId
                }));

            if (bundleItems.length > 0) {
                const { error: bundleError } = await supabase
                    .from('bundle_items')
                    .insert(bundleItems as any);

                if (bundleError) throw bundleError;
            }
        }

        // Handle tags
        if (validatedData.tags) {
            // First, delete existing tags
            await supabase
                .from('catalog_tags')
                .delete()
                .eq('catalog_id', (result as any).id);

            // Then insert new tags
            const tagItems = validatedData.tags
                .filter((tagId: string) => tagId.trim() !== '')
                .map((tagId: string) => ({
                    catalog_id: (result as any).id,
                    tag_id: tagId
                }));

            if (tagItems.length > 0) {
                const { error: tagError } = await supabase
                    .from('catalog_tags')
                    .insert(tagItems as any);

                if (tagError) throw tagError;
            }
        }

        return result;
    } catch (error) {
        console.error('Error creating/updating catalog:', error);
        throw error;
    }
}

export const deleteCatalog = async (id: string) => {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient();

        // First delete bundle items if this is a bundle
        await supabase
            .from('bundle_items')
            .delete()
            .eq('bundle_id', id);

        // Then soft delete the catalog
        const { data, error } = await supabase
            .from('catalog')
            .update({ is_deleted: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting catalog:', error);
        throw error;
    }
}

export const getCatalogBySlug = async (slug: string) => {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient();

        // Get the main catalog by slug
        const { data: catalog, error: catalogError } = await supabase
            .from('catalog')
            .select(`
                *,
                categories:category_id (*),
                brands:brand_id (*)
            `)
            .eq('slug', slug)
            .single();

        return catalog;
    } catch (error) {
        console.error('Error fetching catalog by slug:', error);
        throw error;
    }
}

export const getCatalogWithBundleItems = async (id: string) => {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient();

        // Get the main catalog
        const { data: catalog, error: catalogError } = await supabase
            .from('catalog')
            .select(`
                *,
                categories:category_id (*),
                brands:brand_id (*)
            `)
            .eq('id', id)
            .single();

        if (catalogError) throw catalogError;

        // If it's a bundle, get the bundle items
        if (catalog && (catalog as any).catalog_type === 'bundle') {
            const { data: bundleItems, error: bundleError } = await supabase
                .from('bundle_items')
                .select(`
                    *,
                    costume:catalog!bundle_items_costume_id_fkey (*)
                `)
                .eq('bundle_id', id);

            if (bundleError) throw bundleError;

            // Add bundle items to the catalog data
            return {
                ...(catalog as any),
                bundle_items: bundleItems || [],
                bundle_catalog: bundleItems?.map((item: any) => item.costume_id) || []
            };
        }

        return catalog;
    } catch (error) {
        console.error('Error fetching catalog with bundle items:', error);
        throw error;
    }
}
