"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IBrand, defaultBrand } from "@/lib/types/schemas/brand";
import { usePaginatedQuery } from "./pagination";
import { createOrUpdateBrands as createOrUpdateBrandsAction, deleteBrand as deleteBrandAction } from "../../lib/actions/brand";
import { displayToast } from "@/lib/utils";

export function useBrand(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["brands", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("brands")
                .select("*");

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'search') {
                            query = query.ilike('name', `%${value}%`);
                        }
                    }
                });
            }

            const { data: brands } = await query.order('name', { ascending: true });

            return brands as IBrand[];
        },
    });
}

export function useBrandById(id?: string) {
    return useQuery({
        queryKey: ["brands", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: brand } = await supabase
                .from("brands")
                .select("*")
                .eq("id", id)
                .single();

            return brand ? Object.assign({}, defaultBrand, brand) as IBrand : null;
        },
        enabled: !!id,
    });
}

export function useAllBrands() {
    return useQuery({
        queryKey: ["brands", "all"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: brands } = await supabase
                .from("brands")
                .select("*")
                .order('name', { ascending: true });

            return brands as IBrand[];
        },
    });
}

export function usePaginatedBrands(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return usePaginatedQuery<IBrand>("brands", {
        searchFields: ["name"],
        orderBy: "name",
        orderDirection: "asc",
        ...options
    });
}

export function useCreateOrUpdateBrands() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdateBrandsAction,
        onSuccess: (result, variables) => {
            // Invalidate and refetch brands queries to update the UI
            queryClient.invalidateQueries({ queryKey: ["brands"] });

            // Determine if it was a create or update based on whether the model had an id
            const isUpdate = variables?.id !== undefined && variables?.id !== null;
            displayToast({
                type: "success",
                title: "Success",
                description: `Brand ${isUpdate ? "updated" : "created"} successfully`
            });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to create brand" });
        },
    });
}

export function useDeleteBrand() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBrandAction,
        onSuccess: () => {
            // Invalidate and refetch brands queries to update the UI
            queryClient.invalidateQueries({ queryKey: ["brands"] });
            displayToast({ type: "success", title: "Success", description: "Brand deleted successfully" });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to delete brand" });
        },
    });
}
