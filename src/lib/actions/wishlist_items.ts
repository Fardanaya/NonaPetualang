"use server";

import { createClient } from '@/lib/supabase/server';

export const getWishlistItemsByWishlistId = async (wishlistId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`
      *,
      catalog: catalog_id (
        *,
        category:category_id (*),
        brand:brand_id (*)
      )
    `)
    .eq('wishlist_id', wishlistId)
    .eq('is_deleted', false);

  if (error) throw error;
  return data;
};

export const addWishlistItem = async (wishlistId: string, catalogId: string) => {
  try {
    const supabase = await createClient();

    // Check if item already exists
    const { data: existing, error: checkError } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('wishlist_id', wishlistId)
      .eq('catalog_id', catalogId)
      .eq('is_deleted', false)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existing) {
      // Item already exists
      return existing;
    }

    // Add new item
    const { data: result, error } = await supabase
      .from('wishlist_items')
      .insert({
        wishlist_id: wishlistId,
        catalog_id: catalogId,
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error adding wishlist item:', error);
    throw error;
  }
};

export const removeWishlistItem = async (wishlistItemId: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('wishlist_items')
      .update({ is_deleted: true })
      .eq('id', wishlistItemId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing wishlist item:', error);
    throw error;
  }
};

export const bulkAddWishlistItems = async (wishlistId: string, catalogIds: string[]) => {
  try {
    const supabase = await createClient();

    const wishlistItems = catalogIds.map(catalogId => ({
      wishlist_id: wishlistId,
      catalog_id: catalogId,
    }));

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert(wishlistItems)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error bulk adding wishlist items:', error);
    throw error;
  }
};
