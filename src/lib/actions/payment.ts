"use server";

import { createClient } from '@/lib/supabase/server';

export const createOrUpdate = async (model: any) => {
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from('payments')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating payment:', error);
    throw error;
  }
}

export const deletePayment = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase
      .from('payments') as any)
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
}

export const getAll = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      // .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
}

export const getById = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
}

export const remove = async (id: string) => {
  return deletePayment(id);
}

