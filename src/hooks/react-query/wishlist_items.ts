import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { IWishlistItems } from "@/lib/types/schemas/wishlist-items";
import { displayToast } from "@/lib/utils";
import {
  getWishlistItemsByWishlistId,
  addWishlistItem,
  removeWishlistItem,
  bulkAddWishlistItems
} from "@/lib/actions/wishlist_items";

// Get wishlist items by wishlist ID
export const getWishlistItems = async (wishlistId: string) => {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(`
      *,
      catalog: catalog_id (
        *,
        category:category_id (*),
        brand:brand_id (*)
      )
    `)
    .eq("wishlist_id", wishlistId)
    .eq("is_deleted", false);

  if (error) throw error;
  return data;
};

// React Query hooks
export const useWishlistItems = (wishlistId?: string) => {
  return useQuery({
    queryKey: ["wishlist_items", wishlistId],
    queryFn: () => getWishlistItems(wishlistId!),
    enabled: !!wishlistId,
  });
};

export const useAddWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ wishlistId, catalogId }: { wishlistId: string; catalogId: string }) =>
      addWishlistItem(wishlistId, catalogId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist_items", variables.wishlistId] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      displayToast({
        type: "success",
        title: "Berhasil",
        description: "Item berhasil ditambahkan ke wishlist"
      });
    },
    onError: () => {
      displayToast({
        type: "danger",
        title: "Gagal",
        description: "Gagal menambahkan item ke wishlist"
      });
    },
  });
};

export const useRemoveWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeWishlistItem,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist_items"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      displayToast({
        type: "success",
        title: "Berhasil",
        description: "Item berhasil dihapus dari wishlist"
      });
    },
    onError: () => {
      displayToast({
        type: "danger",
        title: "Gagal",
        description: "Gagal menghapus item dari wishlist"
      });
    },
  });
};

export const useBulkAddWishlistItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ wishlistId, catalogIds }: { wishlistId: string; catalogIds: string[] }) =>
      bulkAddWishlistItems(wishlistId, catalogIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist_items", variables.wishlistId] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      displayToast({
        type: "success",
        title: "Berhasil",
        description: "Item berhasil ditambahkan ke wishlist"
      });
    },
    onError: () => {
      displayToast({
        type: "danger",
        title: "Gagal",
        description: "Gagal menambahkan item ke wishlist"
      });
    },
  });
};
