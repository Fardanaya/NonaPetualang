"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ICart, ICartItem } from "@/lib/types/schemas/cart";
import { addToCart as addToCartAction, updateCartItem as updateCartItemAction, removeFromCart as removeFromCartAction, clearUserCart as clearUserCartAction } from "../../lib/actions/cart";
import { displayToast } from "@/lib/utils";

export function useUserCart() {
    return useQuery({
        queryKey: ["cart"],

        queryFn: async (): Promise<ICartItem[]> => {
            const supabase = supabaseClient();

            // Get current user session
            const { data: session } = await supabase.auth.getSession();
            if (!session.session?.user) {
                return [];
            }

            // First get cart items for current user
            const { data: cartItems, error: cartError } = await supabase
                .from("carts")
                .select("*")
                .eq('user_id', session.session.user.id)
                .eq('is_deleted', false);

            if (cartError) throw cartError;
            if (!cartItems || cartItems.length === 0) return [];

            // Collect all item_ids by type
            const catalogIds: string[] = [];
            const accessoryIds: string[] = [];

            cartItems.forEach((item: any) => {
                if (item.item_type === 'catalog') {
                    catalogIds.push(item.item_id);
                } else if (item.item_type === 'accessory') {
                    accessoryIds.push(item.item_id);
                }
            });

            // Fetch catalogs
            const catalogData: any[] = [];
            if (catalogIds.length > 0) {
                const { data } = await supabase
                    .from("catalog")
                    .select(`
                        id, name, price_per_day, prices, images, slug,
                        brand:brand_id(*),
                        category:category_id(*)
                    `)
                    .in('id', catalogIds)
                    .eq('is_deleted', false);
                if (data) catalogData.push(...data);
            }

            // Fetch accessories
            const accessoryData: any[] = [];
            if (accessoryIds.length > 0) {
                const { data } = await supabase
                    .from("accessories")
                    .select("id, name, type, price, additional_day_price, images, catalog_id")
                    .in('id', accessoryIds)
                    .eq('is_deleted', false);
                if (data) accessoryData.push(...data);
            }

            // Transform the data
            return cartItems.map((item: any) => {
                const result: ICartItem = {
                    ...item,
                };

                if (item.item_type === 'catalog') {
                    result.catalog = catalogData.find(c => c.id === item.item_id);
                } else if (item.item_type === 'accessory') {
                    result.accessory = accessoryData.find(a => a.id === item.item_id);
                }

                return result;
            });
        },
    });
}

export function useAddToCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addToCartAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            displayToast({
                type: "success",
                title: "Success",
                description: "Item added to cart successfully"
            });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to add item to cart" });
        },
    });
}

export function useUpdateCartItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<ICart> }) => updateCartItemAction(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            displayToast({
                type: "success",
                title: "Success",
                description: "Cart item updated successfully"
            });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to update cart item" });
        },
    });
}

export function useRemoveFromCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeFromCartAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            displayToast({
                type: "success",
                title: "Success",
                description: "Item removed from cart successfully"
            });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to remove item from cart" });
        },
    });
}

export function useClearCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: clearUserCartAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            displayToast({
                type: "success",
                title: "Success",
                description: "Cart cleared successfully"
            });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to clear cart" });
        },
    });
}
