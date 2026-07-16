import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePaginatedQuery } from "./pagination";
import { createOrUpdate, deleteWishlist, toggleWishlist } from "@/lib/actions/wishlist";
import { supabase } from "@/lib/supabase";
import { IWishlist } from "@/lib/types/schemas/wishlist";
import { displayToast } from "@/lib/utils";

// Get wishlist by user
export const getWishlistByUser = async (userId: string) => {
    const { data, error } = await supabase
        .from("wishlist")
        .select(`
      *,
      catalog: catalog_id (*, category:category_id (*)),
      user:user_id (*)
    `)
        .eq("user_id", userId);

    if (error) throw error;
    return data;
};

// Get wishlist by catalog
export const getWishlistByCatalog = async (catalogId: string) => {
    const { data, error } = await supabase
        .from("wishlist")
        .select(`
      *,
      catalog: catalog_id (*, category:category_id (*)),
      user:user_id (*)
    `)
        .eq("catalog_id", catalogId);

    if (error) throw error;
    return data;
};

// Check if item is in wishlist
export const checkWishlistItem = async (userId: string, catalogId: string) => {
    const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", userId)
        .eq("catalog_id", catalogId)
        .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
};

// React Query hooks
export const useWishlistByUser = (userId?: string) => {
    return useQuery({
        queryKey: ["wishlist", "user", userId],
        queryFn: () => getWishlistByUser(userId!),
        enabled: !!userId,
    });
};

export const useWishlistByCatalog = (catalogId?: string) => {
    return useQuery({
        queryKey: ["wishlist", "catalog", catalogId],
        queryFn: () => getWishlistByCatalog(catalogId!),
        enabled: !!catalogId,
    });
};

export const useCheckWishlistItem = (userId?: string, catalogId?: string) => {
    return useQuery({
        queryKey: ["wishlist", "check", userId, catalogId],
        queryFn: () => checkWishlistItem(userId!, catalogId!),
        enabled: !!userId && !!catalogId,
    });
};

export const useCreateWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdate,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            // Also invalidate the specific check query
            queryClient.invalidateQueries({
                queryKey: ["wishlist", "check", variables.user_id, variables.catalog_id]
            });
            displayToast({
                type: "success",
                title: "Berhasil",
                description: "Item berhasil ditambahkan ke wishlist"
            });
        },
    });
};

export const useCreateOrUpdateWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { id?: string; wishlist_name: string; date?: string; catalog_ids?: string[] }) => {
            const { createWishlist, updateWishlist } = await import("@/lib/actions/wishlist");
            const { bulkAddWishlistItems } = await import("@/lib/actions/wishlist_items");
            const { getWishlistItemsByWishlistId, removeWishlistItem } = await import("@/lib/actions/wishlist_items");

            let wishlist;

            if (data.id) {
                // Update existing wishlist
                wishlist = await updateWishlist(data.id, data);

                // Handle catalog items for update
                const currentItems = await getWishlistItemsByWishlistId(data.id);
                const currentCatalogIds = currentItems.map(item => item.catalog_id);
                const newCatalogIds = data.catalog_ids || [];

                // Add new items
                const itemsToAdd = newCatalogIds.filter(id => !currentCatalogIds.includes(id));
                if (itemsToAdd.length > 0) {
                    await bulkAddWishlistItems(data.id, itemsToAdd);
                }

                // Remove items that are no longer selected
                const itemsToRemove = currentItems.filter(item => !newCatalogIds.includes(item.catalog_id));
                for (const item of itemsToRemove) {
                    await removeWishlistItem(item.id);
                }
            } else {
                // Create new wishlist
                wishlist = await createWishlist(data);

                if (data.catalog_ids && data.catalog_ids.length > 0) {
                    await bulkAddWishlistItems(wishlist.id, data.catalog_ids);
                }
            }

            return wishlist;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            queryClient.invalidateQueries({ queryKey: ["wishlist_items"] });
            displayToast({
                type: "success",
                title: "Berhasil",
                description: variables.id ? "Wishlist berhasil diperbarui" : "Wishlist berhasil dibuat"
            });
        },
        onError: () => {
            displayToast({
                type: "danger",
                title: "Gagal",
                description: "Gagal menyimpan wishlist"
            });
        },
    });
};

export const useDeleteWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteWishlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        },
    });
};

export const useToggleWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleWishlist,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            // Also invalidate the specific check query
            queryClient.invalidateQueries({
                queryKey: ["wishlist", "check", variables.user_id, variables.catalog_id]
            });
            displayToast({
                type: "success",
                title: "Berhasil",
                description: data.action === 'added' ? "Item berhasil ditambahkan ke wishlist" : "Item berhasil dihapus dari wishlist"
            });
        },
    });
};

export function usePaginatedWishlist(options: { page?: number; pageSize?: number; searchTerm?: string; userId?: string; enabled?: boolean } = {}) {
    const { userId, enabled, ...restOptions } = options;
    return usePaginatedQuery<IWishlist>("wishlist", {
        select: `
        *,
        wishlist_items: wishlist_items!inner (
          catalog: catalog_id (
            id,
            name,
            images
          )
        ),
        user:user_id (*)
        `,
        searchFields: ["wishlist_name"],
        orderBy: "created_at",
        orderDirection: "desc",
        additionalFilters: {
            is_deleted: false,
            ...(userId && { user_id: userId }),
            "wishlist_items.is_deleted": false
        },
        enabled,
        ...restOptions
    });
}
