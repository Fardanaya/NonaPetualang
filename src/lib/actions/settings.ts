"use server";

import { createClient } from '@/lib/supabase/server';
import { settingSchema, ISetting } from '../types/schemas/setting';

export const getSettings = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data as ISetting[];
}

export const getSettingById = async (id: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();
    if (error) return null;
    return data as ISetting;
}

export const updateSetting = async (model: ISetting) => {
    try {
        const supabase = await createClient();
        const validatedData = settingSchema.parse(model);

        // Remove undefined fields for upsert
        const cleanData = Object.fromEntries(
            Object.entries(validatedData).filter(([_, v]) => v !== undefined)
        );

        const { data: result, error } = await supabase
            .from('settings')
            .upsert(cleanData)
            .select()
            .single();

        if (error) throw error;
        return result as ISetting;
    } catch (error) {
        console.error('Error updating setting:', error);
        throw error;
    }
}

export const createSetting = async (model: Partial<ISetting>) => {
    try {
        const supabase = await createClient();
        
        const { data: result, error } = await supabase
            .from('settings')
            .insert({
                value: model.value || "",
                visible: model.visible || false,
            })
            .select()
            .single();

        if (error) throw error;
        return result as ISetting;
    } catch (error) {
        console.error('Error creating setting:', error);
        throw error;
    }
}
