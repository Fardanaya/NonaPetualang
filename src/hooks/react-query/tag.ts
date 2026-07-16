"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ITag, defaultTag } from "@/lib/types/schemas/tag";
import { usePaginatedQuery } from "./pagination";
import { createOrUpdateTag as createOrUpdateTagAction, deleteTag as deleteTagAction } from "../../lib/actions/tag";
import { displayToast } from "@/lib/utils";

export function useTag(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["tags", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("tags")
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

            const { data: tags } = await query.order('name', { ascending: true });

            return tags as ITag[];
        },
    });
}

export function useTagById(id?: string) {
    return useQuery({
        queryKey: ["tags", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: tag } = await supabase
                .from("tags")
                .select("*")
                .eq("id", id)
                .single();

            return tag ? Object.assign({}, defaultTag, tag) as ITag : null;
        },
        enabled: !!id,
    });
}

export function useAllTags() {
    return useQuery({
        queryKey: ["tags", "all"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: tags } = await supabase
                .from("tags")
                .select("*")
                .order('name', { ascending: true });

            return tags as ITag[];
        },
    });
}

export function usePaginatedTags(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return usePaginatedQuery<ITag>("tags", {
        searchFields: ["name", "type"],
        orderBy: "name",
        orderDirection: "asc",
        ...options
    });
}

export function useCreateOrUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdateTagAction,
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });

            const isUpdate = variables?.id !== undefined && variables?.id !== null;
            displayToast({
                type: "success",
                title: "Success",
                description: `Tag ${isUpdate ? "updated" : "created"} successfully`
            });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to create/update tag" });
        },
    });
}

export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTagAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            displayToast({
                type: "success",
                title: "Success",
                description: "Tag deleted successfully"
            });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to delete tag" });
        },
    });
}
