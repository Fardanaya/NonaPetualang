"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IAddress, defaultAddress } from "@/lib/types/schemas/address";
import { createOrUpdate as createOrUpdateAddressAction, deleteAddress as deleteAddressAction } from "@/lib/actions/address";
import { displayToast } from "@/lib/utils";

export function useAddress(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["addresses", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("addresses")
                .select("*")
                .eq('is_deleted', false);

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'user_id') {
                            query = query.eq('user_id', value)
                        }
                    }
                });
            }

            const { data: addresses } = await query.order('created_at', { ascending: false });

            return addresses as IAddress[];
        },
    });
}

export function useAddressById(id?: string) {
    return useQuery({
        queryKey: ["addresses", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: address } = await supabase
                .from("addresses")
                .select("*")
                .eq("id", id)
                .single();

            return address ? Object.assign({}, defaultAddress, address) as IAddress : null;
        },
        enabled: !!id,
    });
}

export function useAllAddresses() {
    return useQuery({
        queryKey: ["addresses", "all"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: addresses } = await supabase
                .from("addresses")
                .select("*")
                .order('created_at', { ascending: false });

            return addresses as IAddress[];
        },
    });
}


export function useCreateOrUpdateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdateAddressAction,
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });

            const isUpdate = variables?.id !== undefined && variables?.id !== null;
            displayToast({
                type: "success",
                title: "Success",
                description: `Address ${isUpdate ? "updated" : "created"} successfully`
            });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to save address" });
        },
    });
}

export function useDeleteAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAddressAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            displayToast({ type: "success", title: "Success", description: "Address deleted successfully" });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to delete address" });
        },
    });
}
