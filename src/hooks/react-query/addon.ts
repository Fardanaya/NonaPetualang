"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IAddOn, defaultAddOn } from "@/lib/types/schemas/add-on";
import { usePaginatedQuery } from "./pagination";
import { createOrUpdateAddonAction, deleteAddonAction } from "../../lib/actions/add_on";
import { displayToast } from "@/lib/utils";

export function useAddon(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["addons", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("add_ons")
                .select("*")
                .eq('is_deleted', false);

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

            const { data: addons } = await query.order('name', { ascending: true });

            return addons as IAddOn[];
        },
    });
}

export function useAddonById(id?: string) {
    return useQuery({
        queryKey: ["addons", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: addon } = await supabase
                .from("add_ons")
                .select("*")
                .eq("id", id)
                .eq('is_deleted', false)
                .single();

            return addon ? Object.assign({}, defaultAddOn, addon) as IAddOn : null;
        },
        enabled: !!id,
    });
}

export function useAllAddons() {
    return useQuery({
        queryKey: ["addons", "all"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: addons } = await supabase
                .from("add_ons")
                .select("*")
                .eq('is_deleted', false)
                .order('name', { ascending: true });

            return addons as IAddOn[];
        },
    });
}

export function usePaginatedAddons(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return usePaginatedQuery<IAddOn>("add_ons", {
        searchFields: ["name"],
        orderBy: "name",
        orderDirection: "asc",
        additionalFilters: { is_deleted: false },
        ...options
    });
}

export function useCreateOrUpdateAddons() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdateAddonAction,
        onMutate: async (newAddon) => {
            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: ["add_ons", "paginated"] });

            // Snapshot the previous value for all paginated queries
            const previousQueries = queryClient.getQueriesData({ queryKey: ["add_ons", "paginated"] });

            // Optimistically update all paginated queries
            queryClient.getQueriesData({ queryKey: ["add_ons", "paginated"] }).forEach(([queryKey, oldData]: [any, any]) => {
                if (!oldData?.data) return;

                if (newAddon.id) {
                    // Update existing addon
                    queryClient.setQueryData(queryKey, {
                        ...oldData,
                        data: oldData.data.map((addon: IAddOn) =>
                            addon.id === newAddon.id ? { ...addon, ...newAddon } : addon
                        )
                    });
                } else {
                    // Add new addon (we'll add it temporarily with a placeholder ID)
                    const optimisticAddon = { ...newAddon, id: `temp-${Date.now()}` };
                    queryClient.setQueryData(queryKey, {
                        ...oldData,
                        data: [...oldData.data, optimisticAddon],
                        pagination: {
                            ...oldData.pagination,
                            totalRecords: oldData.pagination.totalRecords + 1
                        }
                    });
                }
            });

            return { previousQueries };
        },
        onSuccess: (result, variables) => {
            // Update the cache with the actual data from the server
            if (!variables.id) {
                // Replace the optimistic addon with the real one
                queryClient.getQueriesData({ queryKey: ["add_ons", "paginated"] }).forEach(([queryKey, oldData]: [any, any]) => {
                    if (!oldData?.data) return;
                    queryClient.setQueryData(queryKey, {
                        ...oldData,
                        data: oldData.data.map((addon: IAddOn) =>
                            addon.id?.startsWith('temp-') ? result : addon
                        )
                    });
                });
            }

            // Determine if it was a create or update based on whether the model had an id
            const isUpdate = variables?.id !== undefined && variables?.id !== null;
            displayToast({
                type: "success",
                title: "Success",
                description: `Addon ${isUpdate ? "updated" : "created"} successfully`
            });
        },
        onError: (error, variables, context) => {
            // Rollback to the previous value on error
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, data]: [any, any]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            displayToast({ type: "danger", title: "Error", description: "Failed to create addon" });
        },
        onSettled: () => {
            // Only invalidate specific queries that might be affected
            queryClient.invalidateQueries({ queryKey: ["add_ons", "paginated"] });
        },
    });
}

export function useDeleteAddon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAddonAction,
        onMutate: async (id) => {
            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: ["add_ons", "paginated"] });

            // Snapshot the previous value for all paginated queries
            const previousQueries = queryClient.getQueriesData({ queryKey: ["add_ons", "paginated"] });

            // Optimistically remove the addon from all paginated queries
            queryClient.getQueriesData({ queryKey: ["add_ons", "paginated"] }).forEach(([queryKey, oldData]: [any, any]) => {
                if (!oldData?.data) return;
                queryClient.setQueryData(queryKey, {
                    ...oldData,
                    data: oldData.data.filter((addon: IAddOn) => addon.id !== id),
                    pagination: {
                        ...oldData.pagination,
                        totalRecords: oldData.pagination.totalRecords - 1
                    }
                });
            });

            return { previousQueries };
        },
        onSuccess: () => {
            displayToast({ type: "success", title: "Success", description: "Addon deleted successfully" });
        },
        onError: (error, id, context) => {
            // Rollback to the previous value on error
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, data]: [any, any]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            displayToast({ type: "danger", title: "Error", description: "Failed to delete addon" });
        },
        onSettled: () => {
            // Only invalidate specific queries that might be affected
            queryClient.invalidateQueries({ queryKey: ["add_ons", "paginated"] });
        },
    });
}
