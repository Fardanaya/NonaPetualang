"use server";

import { createClient } from '../supabase/server';

export const getAddressesByUser = async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_deleted', false);

  if (error) throw error;
  return data;
}

export const createOrUpdate = async (model: any) => {
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from('addresses')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating address:', error);
    throw error;
  }
}

export const deleteAddress = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase
      .from('addresses') as any)
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
}
