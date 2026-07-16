"use server";

import { createClient } from '@/lib/supabase/server';

export const createOrUpdateTag = async (model: any) => {
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from('tags')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating tag:', error);
    throw error;
  }
}

export const deleteTag = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
}
