"use server";

import { createClient } from '@/lib/supabase/server';
import { penaltySchema, type IPenalty } from '@/lib/types/schemas/penalty';

export const createOrUpdate = async (model: IPenalty) => {
  try {
    const supabase = await createClient();

    // Validate the model against the schema
    const validatedData = penaltySchema.parse(model);

    const { data: result, error } = await supabase
      .from('penalties')
      .upsert(validatedData)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating penalty:', error);
    throw error;
  }
}

export const deletePenalty = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase
      .from('penalties') as any)
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting penalty:', error);
    throw error;
  }
}

export const getByTransactionId = async (transactionId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('penalties')
      .select('*')
      .eq('transaction_id', transactionId)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching penalty:', error);
    throw error;
  }
}
