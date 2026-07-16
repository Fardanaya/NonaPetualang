"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { IAccessoryWithRelations, defaultAccessory } from "@/lib/types/schemas/accessory";
import { usePaginatedQuery } from "./pagination";
import { createOrUpdateAccessory, deleteAccessory } from "@/lib/actions/accessory";
import { displayToast } from "@/lib/utils";

export function useAccessories(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["accessories", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("accessories")
                .select(`
          *,
          catalog:catalog(*)
        `)
                .eq('is_deleted', false);

            console.log("Filters:", filters);

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'search') {
                            query = query.ilike('name', `%${value}%`);
                        } else if (key === 'catalog_id') {
                            query = query.eq('catalog_id', value);
                        } else if (key === 'status') {
                            query = query.eq('status', value);
                        } else if (key === 'minPrice') {
                            query = query.gte('price', value);
                        } else if (key === 'maxPrice') {
                            query = query.lte('price', value);
                        }
                    }
                });
            }

            const { data: accessories } = await query.order('created_at', { ascending: false });
            console.log("Accessories:", accessories);

            return accessories as IAccessoryWithRelations[];
        },
    });
}

export function useAccessoryBySlug(slug?: string) {
    return useQuery({
        queryKey: ["accessories", "slug", slug],
        queryFn: async () => {
            if (!slug) return null;

            const supabase = supabaseClient();
            const { data: accessory } = await supabase
                .from("accessories")
                .select(`
          *,
          catalog:catalog(
            *,
            brand:brand_id(*),
            category:category_id(*)
          )
        `)
                .eq("slug", slug)
                .eq('is_deleted', false)
                .single();

            return accessory ? Object.assign({}, defaultAccessory, accessory) as IAccessoryWithRelations : null;
        },
        enabled: !!slug,
    });
}

export function useAccessoryById(id?: string) {
    return useQuery({
        queryKey: ["accessories", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: accessory } = await supabase
                .from("accessories")
                .select(`
          *,
          catalog:catalog(*)
        `)
                .eq("id", id)
                .eq('is_deleted', false)
                .single();

            return accessory ? Object.assign({}, defaultAccessory, accessory) as IAccessoryWithRelations : null;
        },
        enabled: !!id,
    });
}

export function useGenericAccessories() {
    return useQuery({
        queryKey: ["accessories", "generic"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: accessories } = await supabase
                .from("accessories")
                .select(`
          *,
          catalog:catalog(*)
        `)
                .eq('is_deleted', false)
                .is('catalog_id', null)
                .order('created_at', { ascending: false });

            return accessories as IAccessoryWithRelations[];
        },
    });
}

export function useAllAccessories() {
    return useQuery({
        queryKey: ["accessories", "all"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: accessories } = await supabase
                .from("accessories")
                .select(`
          *,
          catalog:catalog(*)
        `)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            return accessories as IAccessoryWithRelations[];
        },
    });
}

export function useCreateOrUpdateAccessory() {
    return useMutation({
        mutationFn: createOrUpdateAccessory,
        onSuccess: (result, variables) => {
            const isUpdate = variables?.id !== undefined && variables?.id !== null;
            displayToast({
                type: "success",
                title: "Success",
                description: `Accessory ${isUpdate ? "updated" : "created"} successfully`
            });
        },
        onError: () => {
            displayToast({
                type: "danger",
                title: "Error",
                description: "Failed to create/update accessory"
            });
        },
    });
}

export function usePaginatedAccessories(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return usePaginatedQuery<IAccessoryWithRelations>("accessories", {
        searchFields: ["name", "description"],
        orderBy: "created_at",
        orderDirection: "desc",
        additionalFilters: { is_deleted: false },
        ...options
    });
}

export function useDeleteAccessory() {
    return useMutation({
        mutationFn: deleteAccessory,
        onSuccess: () => {
            displayToast({
                type: "success",
                title: "Success",
                description: "Accessory deleted successfully"
            });
        },
        onError: () => {
            displayToast({
                type: "danger",
                title: "Error",
                description: "Failed to delete accessory"
            });
        },
    });
}
