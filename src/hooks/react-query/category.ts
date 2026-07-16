"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ICategory, defaultCategory } from "@/lib/types/schemas/category";
import { usePaginatedQuery } from "./pagination";
import { createOrUpdate as createOrUpdateCategoryAction, deleteCategory as deleteCategoryAction } from "../../lib/actions/category";

export function useCategory(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["categories", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("categories")
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

            const { data: categories } = await query.order('name', { ascending: true });

            return categories as ICategory[];
        },
    });
}

export function useCategoryById(id?: string) {
    return useQuery({
        queryKey: ["categories", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: category } = await supabase
                .from("categories")
                .select("*")
                .eq("id", id)
                .single();

            return category ? Object.assign({}, defaultCategory, category) as ICategory : null;
        },
        enabled: !!id,
    });
}

export function useAllCategories() {
    return useQuery({
        queryKey: ["categories", "all"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: categories } = await supabase
                .from("categories")
                .select("*")
                .order('name', { ascending: true });

            return categories as ICategory[];
        },
    });
}

export function useCreateOrUpdateCategories() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdateCategoryAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}

export function usePaginatedCategories(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return usePaginatedQuery<ICategory>("categories", {
        searchFields: ["name", "description"],
        orderBy: "created_at",
        orderDirection: "desc",
        select: "*",
        ...options
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCategoryAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}
