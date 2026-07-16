"use server";

import { createClient } from '@/lib/supabase/server';
import { voucherApplicabilitySchema } from '../types/schemas/voucher-applicability';

export const createOrUpdate = async (model: any) => {
    try {
        const supabase = await createClient();

        const validatedData = voucherApplicabilitySchema.parse(model);

        const { data: result, error } = await supabase
            .from('voucher_applicability')
            .upsert(validatedData)
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating/updating voucher applicability:', error);
        throw error;
    }
}

export const deleteVoucherApplicability = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('voucher_applicability')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting voucher applicability:', error);
        throw error;
    }
}
