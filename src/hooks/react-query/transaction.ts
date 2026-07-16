"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getTransactions,
    getTransactionById,
    getTransactionsByUser,
    getTransactionsByCatalog,
    createOrUpdateTransaction,
    deleteTransaction,
    updateTransactionStatusBulk,
    getBookedDatesForCatalogItems,
    getBookedDatesForAccessoryItems
} from "@/lib/actions/transaction";
import { displayToast } from "@/lib/utils";
import { usePaginatedQuery } from "./pagination";
import {
    FaHourglass,
    FaClock,
    FaMoneyBillWave,
    FaCreditCard,
    FaTruck,
    FaUndo,
    FaClipboardCheck,
    FaCheckCircle,
    FaPiggyBank,
    FaStar,
    FaTimesCircle,
    FaBan
} from "react-icons/fa";
import { createElement } from "react";

// Constants
export const transactionStatus = [
    {
        value: "pending",
        label: "Pending",
        color: "#FFB347",
        description: "Waiting approval by Admin",
        icon: createElement(FaHourglass),
    },
    {
        value: "waiting",
        label: "Waiting",
        color: "#FFD3B6",
        description: "Waiting Payment by Customer",
        icon: createElement(FaClock),
    },
    {
        value: "dp",
        label: "Down Payment",
        color: "#FFEEAD",
        description: "Customer paid down payment",
        icon: createElement(FaMoneyBillWave),
    },
    {
        value: "paid",
        label: "Paid",
        color: "#B5EAD7",
        description: "Customer paid full amount",
        icon: createElement(FaCreditCard),
    },
    {
        value: "sending",
        label: "Sending",
        color: "#A2C8FF",
        description: "Order is on the way",
        icon: createElement(FaTruck),
    },
    {
        value: "returning",
        label: "Returning",
        color: "#A2C8FF",
        description: "Customer returned the item",
        icon: createElement(FaUndo),
    },
    {
        value: "settlement",
        label: "Settlement",
        color: "#D8B5FF",
        description: "Item has been settled",
        icon: createElement(FaClipboardCheck),
    },
    {
        value: "done",
        label: "Done",
        color: "#DCEDC1",
        description: "Transaction Completed",
        icon: createElement(FaCheckCircle),
    },
];

export const extendedTransactionStatus = [
    {
        value: "deposit",
        label: "Deposit",
        color: "#E8B5FF",
        description: "Depo",
        icon: createElement(FaPiggyBank),
    },
    ...transactionStatus,
    {
        value: "reject",
        label: "Rejected",
        color: "",
        description: "",
        icon: createElement(FaTimesCircle),
    },
    {
        value: "cancel",
        label: "Canceled",
        color: "",
        description: "",
        icon: createElement(FaBan),
    },
];

export const depositExtendedTransactionStatus = [
    {
        value: "deposit",
        label: "Deposit",
        color: "#E8B5FF",
        description: "Depo",
        icon: createElement(FaPiggyBank),
    },
    ...transactionStatus,
];

export const getStatusIndex = (
    status: string,
    arr: { value: string }[] = transactionStatus
) => {
    return arr.findIndex((s) => s.value === status);
};

// React Query Hooks

export const useTransactions = () => {
    return useQuery({
        queryKey: ["transactions"],
        queryFn: getTransactions,
    });
};

export const useTransaction = (id?: string) => {
    return useQuery({
        queryKey: ["transactions", id],
        queryFn: () => getTransactionById(id!),
        enabled: !!id,
    });
};

export const useUserTransactions = (userId?: string) => {
    return useQuery({
        queryKey: ["transactions", "user", userId],
        queryFn: () => getTransactionsByUser(userId!),
        enabled: !!userId,
    });
};

export const useCatalogTransactions = (catalogId?: string) => {
    return useQuery({
        queryKey: ["transactions", "catalog", catalogId],
        queryFn: () => getTransactionsByCatalog(catalogId!),
        enabled: !!catalogId,
    });
};

export const useCreateTransaction = (options?: { silent?: boolean }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createOrUpdateTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            if (!options?.silent) {
                displayToast({ type: "success", title: "Success", description: "Transaction saved successfully" });
            }
        },
        onError: (error: any) => {
            console.error(error);
            if (!options?.silent) {
                displayToast({ type: "danger", title: "Error", description: error?.message || "Failed to save transaction" });
            }
        },
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            displayToast({ type: "success", title: "Success", description: "Transaction deleted successfully" });
        },
        onError: (error: any) => {
            console.error(error);
            displayToast({ type: "danger", title: "Error", description: error?.message || "Failed to delete transaction" });
        },
    });
};

export const useUpdateTransactionStatusBulk = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ catalogId, oldStatus, newStatus }: { catalogId: string, oldStatus: string, newStatus: string }) =>
            updateTransactionStatusBulk(catalogId, oldStatus, newStatus),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            displayToast({ type: "success", title: "Success", description: `Updated ${data.updatedCount} transactions` });
        },
        onError: (error: any) => {
            console.error(error);
            displayToast({ type: "danger", title: "Error", description: error?.message || "Failed to update transaction status" });
        },
    });
};

export const usePaginatedTransactions = (options?: { page?: number; pageSize?: number; searchTerm?: string; userId?: string; enabled?: boolean }) => {
    const { userId, page = 1, pageSize = 10, searchTerm = "", enabled = true } = options || {};

    return useQuery({
        queryKey: ["transactions", "paginated", page, pageSize, searchTerm, userId],
        queryFn: async () => {
            const { supabaseClient } = await import("@/lib/supabase/client");
            const supabase = supabaseClient();

            // Check authentication
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
                throw new Error("Authentication required");
            }

            const offset = (page - 1) * pageSize;

            let query = supabase
                .from("transactions")
                .select("*, transaction_items(*), user:users(*)", { count: "exact" });

            // Apply search filter
            if (searchTerm.trim()) {
                query = query.or(`id.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
            }

            // Apply user filter
            if (userId) {
                query = query.eq('user_id', userId);
            }

            // Apply ordering and pagination
            query = query
                .order("created_at", { ascending: false })
                .range(offset, offset + pageSize - 1);

            const { data, error, count } = await query;

            if (error) {
                console.error("Supabase error for transactions:", error);
                throw error;
            }

            // Enrich with catalog data
            const enrichedData = await enrichTransactionsWithCatalogClient(supabase, data || []);

            const totalRecords = count || 0;
            const totalPages = Math.ceil(totalRecords / pageSize) || 1;
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            return {
                data: enrichedData,
                pagination: {
                    totalRecords,
                    totalPages,
                    currentPage: page,
                    pageSize,
                    hasNextPage,
                    hasPrevPage
                }
            };
        },
        enabled,
    });
};

// Helper function for client-side enrichment
const enrichTransactionsWithCatalogClient = async (supabase: any, transactions: any[]) => {
    if (!transactions || transactions.length === 0) return transactions;

    const catalogIds = transactions
        .flatMap((t: any) => t.transaction_items || [])
        .filter((item: any) => item.item_type === 'catalog')
        .map((item: any) => item.item_id);

    if (catalogIds.length > 0) {
        // Remove duplicates
        const uniqueCatalogIds = [...new Set(catalogIds)];

        const { data: catalogs } = await supabase
            .from('catalog')
            .select('*')
            .in('id', uniqueCatalogIds);

        const catalogMap = new Map(catalogs?.map((c: any) => [c.id, c]));

        transactions.forEach((t: any) => {
            // Find the first catalog item
            const catalogItem = t.transaction_items?.find((i: any) => i.item_type === 'catalog');
            if (catalogItem) {
                t.catalog = catalogMap.get(catalogItem.item_id);
            }
        });
    }
    return transactions;
};

export const useBookedDatesForCatalogItems = (catalogIds: string[]) => {
    return useQuery({
        queryKey: ["booked-dates", "catalog", catalogIds],
        queryFn: () => getBookedDatesForCatalogItems(catalogIds),
        enabled: catalogIds.length > 0,
    });
};

export const useBookedDatesForAccessoryItems = (accessoryIds: string[]) => {
    return useQuery({
        queryKey: ["booked-dates", "accessory", accessoryIds],
        queryFn: () => getBookedDatesForAccessoryItems(accessoryIds),
        enabled: accessoryIds.length > 0,
    });
};
