"use server";

import { createClient } from '@/lib/supabase/server';

export const getAllTransactionAddons = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transaction_addons')
    .select('*, add_on:add_ons(*)')
    .eq('is_deleted', false);

  if (error) throw error;
  return data;
};

export const getTransactionAddonsByTransactionId = async (transactionId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transaction_addons')
    .select('*, add_on:add_ons(*)') // Fetch related add_on details if needed
    .eq('transaction_id', transactionId)
    .eq('is_deleted', false);

  if (error) throw error;
  return data;
};

export const createOrUpdateTransactionAddon = async (model: any) => {
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from('transaction_addons')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating transactionAddon:', error);
    throw error;
  }
}

export const deleteTransactionAddon = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('transaction_addons')
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting transactionAddon:', error);
    throw error;
  }
}
