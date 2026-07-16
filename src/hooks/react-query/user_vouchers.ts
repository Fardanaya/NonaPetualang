"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IUserVoucher, defaultUserVoucher } from "@/lib/types/schemas/user-voucher";
import { createOrUpdate as createOrUpdateAction, deleteUserVoucher as deleteAction } from "@/lib/actions/user_vouchers";
import { displayToast } from "@/lib/utils";

export function useUserVouchers(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["user_vouchers", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("user_vouchers")
                .select(`
                    *,
                    users:user_id (
                        id,
                        email,
                        name,
                        full_name,
                        instagram
                    ),
                    vouchers:vouchers_id (
                        id,
                        code,
                        name,
                        type
                    )
                `);

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'user_id') {
                            query = query.eq('user_id', value);
                        }
                        if (key === 'vouchers_id') {
                            query = query.eq('vouchers_id', value);
                        }
                    }
                });
            }

            const { data: user_vouchers } = await query.order('created_at', { ascending: false });

            return user_vouchers as Array<IUserVoucher & {
                users: { id: string; email: string; name: string; full_name: string; instagram: string };
                vouchers: { id: string; code: string; name: string; type: string };
            }>;
        },
    });
}

export function useUserVouchersByVoucher(voucherId?: string) {
    return useQuery({
        queryKey: ["user_vouchers", "voucher", voucherId],
        queryFn: async () => {
            if (!voucherId) return [];

            const supabase = supabaseClient();
            const { data: user_vouchers } = await supabase
                .from("user_vouchers")
                .select(`
                    *,
                    users:user_id (
                        id,
                        email,
                        name,
                        full_name,
                        instagram
                    )
                `)
                .eq("vouchers_id", voucherId)
                .order('created_at', { ascending: false });

            // Filter out records where users relationship is null
            return ((user_vouchers || []) as any[]).filter(uv => uv.users).map(uv => uv as IUserVoucher & {
                users: { id: string; email: string; name: string; full_name: string; instagram: string };
            });
        },
        enabled: !!voucherId,
    });
}

export function useUserVoucherById(id?: string) {
    return useQuery({
        queryKey: ["user_vouchers", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: user_voucher } = await supabase
                .from("user_vouchers")
                .select(`
                    *,
                    users:user_id (
                        id,
                        email,
                        name,
                        full_name,
                        instagram
                    ),
                    vouchers:vouchers_id (
                        id,
                        code,
                        name,
                        type
                    )
                `)
                .eq("id", id)
                .single();

            return user_voucher ? Object.assign({}, defaultUserVoucher, user_voucher) as IUserVoucher : null;
        },
        enabled: !!id,
    });
}

export function useCreateOrUpdateUserVouchers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdateAction,
        onSuccess: () => {
            // Invalidate and refetch user_vouchers queries
            queryClient.invalidateQueries({ queryKey: ["user_vouchers"] });
            displayToast({
                type: "success",
                title: "Success",
                description: "User voucher assignment updated successfully"
            });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to update user voucher" });
        },
    });
}

export function useDeleteUserVoucher() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user_vouchers"] });
            displayToast({ type: "success", title: "Success", description: "User voucher removed successfully" });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to remove user voucher" });
        },
    });
}

// Interface for voucher validation
interface ApplyVoucherParams {
    code: string;
    userId?: string;
    catalogIds?: string[]; // Array of catalog IDs in checkout
}

interface VoucherValidationResult {
    success: boolean;
    voucher?: any;
    error?: string;
    applicableCatalogIds?: string[] | null; // null means apply to all
    isGlobalVoucher?: boolean;
}

export function useApplyVoucher() {
    return useMutation({
        mutationFn: async ({ code, userId, catalogIds = [] }: ApplyVoucherParams): Promise<VoucherValidationResult> => {
            const supabase = supabaseClient();

            // 1. Get voucher by code
            const { data, error: voucherError } = await supabase
                .from('vouchers')
                .select(`
                    *,
                    voucher_applicability (*)
                `)
                .eq('code', code.trim().toUpperCase())
                .eq('is_deleted', false)
                .single();

            const voucher = data as any;

            if (voucherError || !voucher) {
                return {
                    success: false,
                    error: "Kode voucher tidak ditemukan"
                };
            }

            // 2. Check if voucher is enabled
            if (!voucher.is_enable) {
                return {
                    success: false,
                    error: "Voucher ini sedang tidak aktif"
                };
            }

            // 3. Check date validity
            const now = new Date();
            if (voucher.start_date && new Date(voucher.start_date) > now) {
                const startDate = new Date(voucher.start_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                return {
                    success: false,
                    error: "Voucher Tidak Dapat Ditemukan"
                };
            }
            if (voucher.end_date && new Date(voucher.end_date) < now) {
                return {
                    success: false,
                    error: "Voucher ini sudah tidak berlaku"
                };
            }

            // 4. Check global usage limit
            const { count: globalUsageCount } = await supabase
                .from('user_vouchers')
                .select('*', { count: 'exact', head: true })
                .eq('vouchers_id', voucher.id);

            if (voucher.usage_limit && (globalUsageCount || 0) >= voucher.usage_limit) {
                return {
                    success: false,
                    error: "Kuota penggunaan voucher ini sudah habis"
                };
            }

            // 5. Check per-user usage limit
            if (userId) {
                const { data } = await supabase
                    .from('user_vouchers')
                    .select('usage_count')
                    .eq('vouchers_id', voucher.id)
                    .eq('user_id', userId)
                    .single();

                const userVoucher = data as any;

                if (userVoucher && voucher.per_user_limit && userVoucher.usage_count >= voucher.per_user_limit) {
                    return {
                        success: false,
                        error: `Kamu sudah menggunakan voucher ini ${userVoucher.usage_count}x`
                    };
                }
            }

            // 6. Check voucher applicability (if not apply_to_all)
            const applicability = voucher.voucher_applicability || [];
            const hasGlobalApplicability = applicability.some((app: any) => app.apply_to_all === true);

            // Get applicable catalog IDs from voucher
            const applicableCatalogIds = hasGlobalApplicability
                ? catalogIds // If global, all catalogs are applicable
                : applicability
                    .filter((app: any) => app.catalog_id)
                    .map((app: any) => app.catalog_id);

            if (!hasGlobalApplicability && applicability.length > 0 && catalogIds.length > 0) {
                // Check if any catalog in checkout matches voucher applicability
                const hasApplicableItem = catalogIds.some(
                    (catalogId) => applicableCatalogIds.includes(catalogId)
                );

                if (!hasApplicableItem) {
                    return {
                        success: false,
                        error: "Voucher ini tidak berlaku untuk item yang kamu pilih"
                    };
                }
            }

            // All checks passed - return voucher with applicable catalog IDs
            return {
                success: true,
                voucher,
                applicableCatalogIds: hasGlobalApplicability ? null : applicableCatalogIds, // null means apply to all
                isGlobalVoucher: hasGlobalApplicability
            };
        },
    });
}
