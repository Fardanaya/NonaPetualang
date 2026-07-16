"use server";

import { createClient } from '@/lib/supabase/server';

export const createOrUpdate = async (model: any) => {
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from('shipping')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating shipping:', error);
    throw error;
  }
}

export const deleteShipping = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase
      .from('shipping') as any)
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting shipping:', error);
    throw error;
  }
}

export const getAll = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('shipping')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching shipping:', error);
    throw error;
  }
}

export const getById = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('shipping')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching shipping:', error);
    throw error;
  }
}

export const remove = async (id: string) => {
  return deleteShipping(id);
}

