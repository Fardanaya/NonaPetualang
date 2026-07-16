"use server";

import { createClient } from '@/lib/supabase/server';
import z from "zod";

const bundleItemSchema = z.object({
    id: z.string().optional(),
    bundle_id: z.string().nullable().optional(),
    costume_id: z.string().nullable().optional(),

});

export const createOrUpdateBundleItem = async (model: any) => {
    try {
        const supabase = await createClient();

        const validatedData = bundleItemSchema.parse(model);

        const { data: result, error } = await supabase
            .from('bundle_items')
            .upsert(validatedData)
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating/updating bundle item:', error);
        throw error;
    }
}

export const deleteBundleItem = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('bundle_items')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting bundle item:', error);
        throw error;
    }
}
