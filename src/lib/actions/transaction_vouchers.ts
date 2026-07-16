"use server";

import { createClient } from '@/lib/supabase/server';
import { transactionVoucherSchema } from '../types/schemas/transaction-voucher';

export const createOrUpdate = async (model: any) => {
    try {
        const supabase = await createClient();

        const validatedData = transactionVoucherSchema.parse(model);

        const { data: result, error } = await supabase
            .from('transaction_vouchers')
            .upsert(validatedData)
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating/updating transaction voucher:', error);
        throw error;
    }
}

export const deleteTransactionVoucher = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('transaction_vouchers')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting transaction voucher:', error);
        throw error;
    }
}
