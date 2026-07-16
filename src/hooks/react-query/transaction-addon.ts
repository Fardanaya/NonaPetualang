"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createOrUpdateTransactionAddon,
    deleteTransactionAddon,
    getTransactionAddonsByTransactionId,
    getAllTransactionAddons
} from "@/lib/actions/transaction_addon";
import { displayToast } from "@/lib/utils";

export const useAllTransactionAddons = () => {
    return useQuery({
        queryKey: ["transaction-addons"],
        queryFn: getAllTransactionAddons,
    });
};

export const useTransactionAddons = (transactionId?: string) => {
    return useQuery({
        queryKey: ["transaction-addons", transactionId],
        queryFn: () => getTransactionAddonsByTransactionId(transactionId!),
        enabled: !!transactionId,
    });
};

export const useCreateTransactionAddon = (options?: { silent?: boolean }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createOrUpdateTransactionAddon,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["transaction-addons", data?.transaction] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            if (!options?.silent) {
                displayToast({ type: "success", title: "Success", description: "Addon saved successfully" });
            }
        },
        onError: (error: any) => {
            console.error(error);
            if (!options?.silent) {
                displayToast({ type: "danger", title: "Error", description: error?.message || "Failed to save addon" });
            }
        },
    });
};

export const useDeleteTransactionAddon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTransactionAddon,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["transaction-addons", data?.transaction] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            displayToast({ type: "success", title: "Success", description: "Addon deleted successfully" });
        },
        onError: (error: any) => {
            console.error(error);
            displayToast({ type: "danger", title: "Error", description: error?.message || "Failed to delete addon" });
        },
    });
};
