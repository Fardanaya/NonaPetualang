"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IVoucher, IVoucherWithApplicability, defaultVoucher, defaultVoucherWithApplicability } from "@/lib/types/schemas/voucher";
import { usePaginatedQuery } from "./pagination";
import { createOrUpdate as createOrUpdateVoucherAction, deleteVoucher as deleteVoucherAction } from "@/lib/actions/vouchers";
import { createOrUpdate as createOrUpdateApplicabilityAction, deleteVoucherApplicability } from "@/lib/actions/voucher_applicability";
import { displayToast } from "@/lib/utils";

export function useVouchers(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["vouchers", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("vouchers")
                .select("*");

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'search') {
                            query = query.ilike('code', `%${value}%`).or('name.ilike.%${value}%');
                        } else if (key === 'is_enable') {
                            query = query.eq('is_enable', value);
                        } else if (key === 'type') {
                            query = query.eq('type', value);
                        } else if (key === 'discount_type') {
                            query = query.eq('discount_type', value);
                        }
                    }
                });
            }

            const { data: vouchers } = await query
                .eq("is_deleted", false)
                .order('code', { ascending: true });

            return vouchers as IVoucher[];
        },
    });
}

export function useVouchersWithApplicability(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["vouchers", "with-applicability", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("vouchers")
                .select(`
                    *,
                    voucher_applicability (*)
                `);

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'search') {
                            query = query.ilike('code', `%${value}%`).or('name.ilike.%${value}%');
                        } else if (key === 'is_enable') {
                            query = query.eq('is_enable', value);
                        }
                    }
                });
            }

            const { data: vouchers } = await query
                .eq("is_deleted", false)
                .order('code', { ascending: true });

            return vouchers as IVoucherWithApplicability[];
        },
    });
}

export function useVoucherById(id?: string) {
    return useQuery({
        queryKey: ["vouchers", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: voucher } = await supabase
                .from("vouchers")
                .select(`
                    *,
                    voucher_applicability (*)
                `)
                .eq("id", id)
                .eq("is_deleted", false)
                .single();

            return voucher ? Object.assign({}, defaultVoucherWithApplicability, voucher) as IVoucherWithApplicability : null;
        },
        enabled: !!id,
    });
}

export function usePaginatedVouchers(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return usePaginatedQuery<IVoucherWithApplicability>("vouchers", {
        searchFields: ["code", "name"],
        orderBy: "code",
        orderDirection: "asc",
        additionalFilters: { is_deleted: false },
        select: "*, voucher_applicability (*)",
        transformData: (data) => data.map((voucher: any) => ({
            ...voucher,
            applicability: voucher.voucher_applicability || []
        })),
        ...options
    });
}

export function useCreateOrUpdateVoucher() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: IVoucherWithApplicability) => {
            // Create/update voucher first
            const { applicability, ...voucherData } = data;
            const voucherResult = await createOrUpdateVoucherAction(voucherData);

            // Handle applicability if provided
            if (applicability && applicability.length > 0) {
                // Delete existing applicability
                if (voucherData.id) {
                    const supabase = supabaseClient();
                    await supabase
                        .from('voucher_applicability')
                        .delete()
                        .eq('voucher_id', voucherData.id);
                }

                // Create new applicability
                const applicabilityPromises = applicability.map(({ id, ...app }) => ({
                    ...app,
                    voucher_id: voucherResult.id,
                }));

                for (const appData of applicabilityPromises) {
                    await createOrUpdateApplicabilityAction(appData);
                }
            }

            return voucherResult;
        },
        onSuccess: (result, variables) => {
            // Invalidate and refetch vouchers queries
            queryClient.invalidateQueries({ queryKey: ["vouchers"] });

            const isUpdate = variables?.id !== undefined && variables?.id !== null;
            displayToast({
                type: "success",
                title: "Success",
                description: `Voucher ${isUpdate ? "updated" : "created"} successfully`
            });
        },
    });
}

export function useDeleteVoucher() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            // Delete voucher applicability first
            const supabase = supabaseClient();
            await supabase
                .from('voucher_applicability')
                .delete()
                .eq('voucher_id', id);

            // Delete voucher
            return await deleteVoucherAction(id);
        },
        onSuccess: () => {
            // Invalidate and refetch vouchers queries
            queryClient.invalidateQueries({ queryKey: ["vouchers"] });
            displayToast({ type: "warning", title: "Success", description: "Voucher deleted successfully" });
        },
    });
}
