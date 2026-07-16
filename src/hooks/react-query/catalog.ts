"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ICatalogWithRelations, defaultCatalog } from "@/lib/types/schemas/catalog";
import { usePaginatedQuery } from "./pagination";
import { createOrUpdate as createOrUpdateCatalogAction, deleteCatalog as deleteCatalogAction } from "@/lib/actions/catalog";
import { displayToast } from "@/lib/utils";

export function useCatalog(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["catalog", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("catalog")
                .select(`
          *,
          brand:brand_id(*),
          category:category_id(*)
        `)
                .eq('is_deleted', false);

            console.log("Filters:", filters);

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'search') {
                            query = query.ilike('name', `%${value}%`);
                        } else if (key === 'brand') {
                            query = query.eq('brand_id', value);
                        } else if (key === 'category') {
                            query = query.eq('category_id', value);
                        } else if (key === 'catalogType') {
                            query = query.eq('catalog_type', value);
                        } else if (key === 'status') {
                            query = query.eq('status', value);
                        } else if (key === 'size') {
                            query = query.eq('size', value);
                        } else if (key === 'gender') {
                            query = query.eq('gender', value);
                        } else if (key === 'minPrice') {
                            query = query.gte('price', value);
                        } else if (key === 'maxPrice') {
                            query = query.lte('price', value);
                        }
                    }
                });
            }

            const { data: catalogs } = await query.order('created_at', { ascending: false });
            console.log("Catalogs:", catalogs);

            // Apply nested filters in JavaScript since they can't be filtered in Supabase query
            let filteredCatalogs = catalogs || <any>[];

            if (filters?.category) {
                filteredCatalogs = filteredCatalogs.filter((catalog: any) =>
                    catalog.category?.id === filters.category
                );
            }

            // For bundles, fetch bundle items to populate bundle_catalog
            const bundleIds = filteredCatalogs
                .filter((catalog: any) => catalog.catalog_type === 'bundle')
                .map((catalog: any) => catalog.id);

            if (bundleIds.length > 0) {
                const { data: bundleItems, error: bundleError } = await supabase
                    .from('bundle_items')
                    .select(`
                        bundle_id,
                        costume:catalog!bundle_items_costume_id_fkey (*, brand:brand_id(*), category:category_id(*))
                    `)
                    .in('bundle_id', bundleIds);

                if (bundleError) throw bundleError;

                // Group bundle items by bundle_id
                const bundleItemsMap: Record<string, any[]> = {};
                (bundleItems || []).forEach((item: any) => {
                    const bundleId = item.bundle_id;
                    if (!bundleItemsMap[bundleId]) {
                        bundleItemsMap[bundleId] = [];
                    }
                    bundleItemsMap[bundleId].push(item.costume);
                });

                // Add bundle_catalog to bundles
                filteredCatalogs = filteredCatalogs.map((catalog: any) => {
                    if (catalog.catalog_type === 'bundle') {
                        return {
                            ...catalog,
                            bundle_catalog: bundleItemsMap[catalog.id] || [],
                            is_bundle: true
                        } as ICatalogWithRelations & { bundle_catalog: any[], is_bundle: boolean };
                    }
                    return catalog;
                });
            }

            return filteredCatalogs as ICatalogWithRelations[];
        },
    });
}

export function useCatalogById(id?: string) {
    return useQuery({
        queryKey: ["catalog", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: catalog } = await supabase
                .from("catalog")
                .select(`
          *,
          brand:brand_id(*),
          category:category_id(*),
          catalog_tags(tag_id)
        `)
                .eq("id", id)
                .eq('is_deleted', false)
                .single();

            if (!catalog) return null;

            // If it's a bundle, get the bundle items
            if ((catalog as any).catalog_type === 'bundle') {
                const { data: bundleItems, error: bundleError } = await supabase
                    .from('bundle_items')
                    .select(`
                        *,
                        costume:catalog!bundle_items_costume_id_fkey (*, brand:brand_id(*), category:category_id(*))
                    `)
                    .eq('bundle_id', id);

                if (bundleError) throw bundleError;

                // Add bundle items to the catalog data
                return Object.assign({}, defaultCatalog, {
                    ...(catalog as any),
                    bundle_items: bundleItems || [],
                    bundle_catalog: bundleItems?.map((item: any) => item.costume_id) || [],
                    is_bundle: true
                }) as ICatalogWithRelations;
            }

            return Object.assign({}, defaultCatalog, catalog as any) as ICatalogWithRelations;
        },
        enabled: !!id,
    });
}

export function useCatalogBySlug(slug?: string) {
    return useQuery({
        queryKey: ["catalog", "slug", slug],
        queryFn: async () => {
            if (!slug) return null;

            const supabase = supabaseClient();
            const { data: catalog } = await supabase
                .from("catalog")
                .select(`
          *,
          brand:brand_id(*),
          category:category_id(*)
        `)
                .eq("slug", slug)
                .eq('is_deleted', false)
                .single();

            if (!catalog) return null;

            // If it's a bundle, get the bundle items
            if ((catalog as any).catalog_type === 'bundle') {
                const { data: bundleItems, error: bundleError } = await supabase
                    .from('bundle_items')
                    .select(`
                        *,
                        costume:catalog!bundle_items_costume_id_fkey (*, brand:brand_id(*), category:category_id(*))
                    `)
                    .eq('bundle_id', (catalog as any).id);

                if (bundleError) throw bundleError;

                // Add bundle items to the catalog data
                return Object.assign({}, defaultCatalog, {
                    ...(catalog as any),
                    bundle_items: bundleItems || [],
                    bundle_catalog: bundleItems?.map((item: any) => item.costume_id) || [],
                    is_bundle: true
                }) as ICatalogWithRelations;
            }

            return Object.assign({}, defaultCatalog, catalog as any) as ICatalogWithRelations;
        },
        enabled: !!slug,
    });
}

export function useAllCatalogs() {
    return useQuery({
        queryKey: ["catalog", "all"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: catalogs } = await supabase
                .from("catalog")
                .select(`
          *,
          brand:brand_id(*),
          category:category_id(*)
        `)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            return catalogs as ICatalogWithRelations[];
        },
    });
}

export function useCreateOrUpdateCatalog() {
    return useMutation({
        mutationFn: createOrUpdateCatalogAction,
        onSuccess: (result, variables) => {
            // Determine if it was a create or update based on whether the model had an id
            const isUpdate = variables?.id !== undefined && variables?.id !== null;
            displayToast({
                type: "success",
                title: "Success",
                description: `Catalog ${isUpdate ? "updated" : "created"} successfully`
            });
        },
        onError: () => {
            displayToast({
                type: "danger",
                title: "Error",
                description: "Failed to create/update catalog"
            });
        },
    });
}

export function usePaginatedCatalog(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return usePaginatedQuery<ICatalogWithRelations>("catalog", {
        searchFields: ["name", "description"],
        orderBy: "created_at",
        orderDirection: "desc",
        additionalFilters: { is_deleted: false },
        ...options
    });
}

export function useDeleteCatalog() {
    return useMutation({
        mutationFn: deleteCatalogAction,
        onSuccess: () => {
            displayToast({
                type: "success",
                title: "Success",
                description: "Catalog deleted successfully"
            });
        },
        onError: () => {
            displayToast({
                type: "danger",
                title: "Error",
                description: "Failed to delete catalog"
            });
        },
    });
}
