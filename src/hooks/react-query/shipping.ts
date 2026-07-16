"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createOrUpdate,
    getAll,
    getById,
    remove
} from "@/lib/actions/shipping";
import { displayToast } from "@/lib/utils";

// React Query Hooks for Shipping

export const useShippings = () => {
    return useQuery({
        queryKey: ["shippings"],
        queryFn: getAll,
    });
};

export const useShipping = (id?: string) => {
    return useQuery({
        queryKey: ["shippings", id],
        queryFn: () => getById(id!),
        enabled: !!id,
    });
};

export const useCreateOrUpdateShipping = (options?: { silent?: boolean }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createOrUpdate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shippings"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            if (!options?.silent) {
                displayToast({ type: "success", title: "Success", description: "Shipping saved successfully" });
            }
        },
        onError: (error: any) => {
            console.error(error);
            if (!options?.silent) {
                displayToast({ type: "danger", title: "Error", description: error?.message || "Failed to save shipping" });
            }
        },
    });
};

export const useDeleteShipping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shippings"] });
            displayToast({ type: "success", title: "Success", description: "Shipping deleted successfully" });
        },
        onError: (error: any) => {
            console.error(error);
            displayToast({ type: "danger", title: "Error", description: error?.message || "Failed to delete shipping" });
        },
    });
};
