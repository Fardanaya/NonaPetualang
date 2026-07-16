"use server";

import { createClient } from '@/lib/supabase/server';
import { ITransactionItem } from '@/lib/types/schemas/transaction-item';

export const createTransactionItem = async (model: Partial<ITransactionItem>) => {
    try {
        const supabase = await createClient();
        const { data: result, error } = await supabase
            .from('transaction_items')
            .insert(model)
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating transaction item:', error);
        throw error;
    }
};

export const createTransactionItems = async (items: Partial<ITransactionItem>[]) => {
    try {
        const supabase = await createClient();
        const { data: result, error } = await supabase
            .from('transaction_items')
            .insert(items)
            .select();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating transaction items:', error);
        throw error;
    }
};

export const getTransactionItemsByTransactionId = async (transactionId: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('transaction_items')
            .select('*')
            .eq('transaction_id', transactionId)
            .eq('is_deleted', false);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching transaction items:', error);
        throw error;
    }
};

export const deleteTransactionItem = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('transaction_items')
            .update({ is_deleted: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting transaction item:', error);
        throw error;
    }
};
