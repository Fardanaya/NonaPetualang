"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createTransactionItem,
    createTransactionItems,
    deleteTransactionItem,
    getTransactionItemsByTransactionId
} from "@/lib/actions/transaction-items";
import { displayToast } from "@/lib/utils";
import { ITransactionItem } from "@/lib/types/schemas/transaction-item";

export const useTransactionItems = (transactionId?: string) => {
    return useQuery({
        queryKey: ["transaction-items", transactionId],
        queryFn: () => getTransactionItemsByTransactionId(transactionId!),
        enabled: !!transactionId,
    });
};

export const useCreateTransactionItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTransactionItem,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["transaction-items", data?.transaction_id] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            displayToast({ type: "success", title: "Success", description: "Transaction item created successfully" });
        },
        onError: (error: any) => {
            console.error(error);
            displayToast({ type: "danger", title: "Error", description: error?.message || "Failed to create transaction item" });
        },
    });
};

export const useCreateTransactionItems = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTransactionItems,
        onSuccess: (data) => {
            if (Array.isArray(data) && data.length > 0) {
                queryClient.invalidateQueries({ queryKey: ["transaction-items", data[0].transaction_id] });
            } else {
                queryClient.invalidateQueries({ queryKey: ["transaction-items"] });
            }
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            displayToast({ type: "success", title: "Success", description: "Transaction items created successfully" });
        },
        onError: (error: any) => {
            console.error(error);
            displayToast({ type: "danger", title: "Error", description: error?.message || "Failed to create transaction items" });
        },
    });
};

export const useDeleteTransactionItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTransactionItem,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["transaction-items", data?.transaction_id] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            displayToast({ type: "success", title: "Success", description: "Transaction item deleted successfully" });
        },
        onError: (error: any) => {
            console.error(error);
            displayToast({ type: "danger", title: "Error", description: error?.message || "Failed to delete transaction item" });
        },
    });
};
