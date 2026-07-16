"use server";

import { createClient } from '@/lib/supabase/server';

export const createOrUpdate = async (model: any) => {
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from('categories')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating category:', error);
    throw error;
  }
}

export const deleteCategory = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}
