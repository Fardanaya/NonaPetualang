"use server";

import { createClient } from '@/lib/supabase/server';

export const createOrUpdateBrands = async (model: any) => {
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from('brands')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating brand:', error);
    throw error;
  }
}

export const deleteBrand = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
}
