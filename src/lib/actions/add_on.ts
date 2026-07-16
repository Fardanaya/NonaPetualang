"use server";

import { createClient } from '@/lib/supabase/server';

export const createOrUpdateAddonAction = async (model: any) => {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized: User not authenticated');
    }

    const { data: result, error } = await supabase
      .from('add_ons')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating addon:', error);
    throw error;
  }
}

export const deleteAddonAction = async (id: string) => {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized: User not authenticated');
    }

    const { data, error } = await (supabase
      .from('add_ons') as any)
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting addon:', error);
    throw error;
  }
}
