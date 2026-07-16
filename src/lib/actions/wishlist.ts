"use server";

import { createClient } from '@/lib/supabase/server';

export const getWishlistByUser = async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('wishlist')
    .select('*, catalog(*)')
    .eq('user_id', userId)
    .eq('is_deleted', false);

  if (error) throw error;
  return data;
}

export const createWishlist = async (model: any) => {
  try {
    const supabase = await createClient();
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const { data: result, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: user.data.user.id,
        wishlist_name: model.wishlist_name,
        date: model.date,
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating wishlist:', error);
    throw error;
  }
}

export const updateWishlist = async (id: string, model: any) => {
  try {
    const supabase = await createClient();

    const { data: result, error } = await supabase
      .from('wishlist')
      .update({
        wishlist_name: model.wishlist_name,
        date: model.date,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error updating wishlist:', error);
    throw error;
  }
}

export const createOrUpdate = async (model: any) => {
  try {
    const supabase = await createClient();
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    // First check if item already exists in wishlist
    const { data: existing, error: checkError } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.data.user.id)
      .eq('catalog_id', model.catalog_id)
      .eq('is_deleted', false)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existing) {
      // Item already exists, return it
      return existing;
    }

    // Item doesn't exist, insert it
    const { data: result, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: user.data.user.id,
        catalog_id: model.catalog_id,
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating wishlist:', error);
    throw error;
  }
}

export const deleteWishlist = async (id: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('wishlist')
      .update({ is_deleted: true })

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting wishlist:', error);
    throw error;
  }
}

export const toggleWishlist = async (model: any) => {
  try {
    const supabase = await createClient();
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    // Check if item already exists in wishlist
    const { data: existing, error: checkError } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.data.user.id)
      .eq('catalog_id', model.catalog_id)
      .eq('is_deleted', false)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existing) {
      // Item exists, delete it
      const { error } = await supabase
        .from('wishlist')
        .update({ is_deleted: true })
        .eq('id', existing.id);

      if (error) throw error;
      return { action: 'removed', id: existing.id };
    } else {
      // Item doesn't exist, insert it
      const { data: result, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.data.user.id,
          catalog_id: model.catalog_id,
        })
        .select()
        .single();

      if (error) throw error;
      return { action: 'added', data: result };
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
}
