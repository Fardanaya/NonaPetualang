"use server";

import { createClient } from '@/lib/supabase/server';
import { userVoucherSchema } from '../types/schemas/user-voucher';

export const createOrUpdate = async (model: any) => {
    try {
        const supabase = await createClient();

        const validatedData = userVoucherSchema.parse(model);

        const { data: result, error } = await supabase
            .from('user_vouchers')
            .upsert(validatedData)
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating/updating user voucher:', error);
        throw error;
    }
}

export const deleteUserVoucher = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('user_vouchers')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting user voucher:', error);
        throw error;
    }
}
