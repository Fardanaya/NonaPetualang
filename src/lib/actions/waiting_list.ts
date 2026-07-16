"use server";

import { createClient } from '@/lib/supabase/server';

export const getAll = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('waiting_list').select('*');
  if (error) throw error;
  return data;
}

export const getById = async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('waiting_list').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export const getByCatalog = async (catalogId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('waiting_list').select('*').eq('catalog', catalogId);
  if (error) throw error;
  return data;
}

export const createOrUpdate = async (model: any) => {
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from('waiting_list')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating waitingList:', error);
    throw error;
  }
}

export const deleteWaitingList = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('waiting_list')
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting waitingList:', error);
    throw error;
  }
}
