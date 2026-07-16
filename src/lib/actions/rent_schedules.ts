"use server";

import { createClient } from '@/lib/supabase/server';
import { rentScheduleSchema } from "../types/schemas/rent-schedule";

export const createOrUpdate = async (model: any) => {
    try {
        const supabase = await createClient();

        const validatedData = rentScheduleSchema.parse(model);

        const { data: result, error } = await supabase
            .from('rent_schedules')
            .upsert(validatedData)
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating/updating rent schedule:', error);
        throw error;
    }
}

export const deleteRentSchedule = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('rent_schedules')
            .update({ is_deleted: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting rent schedule:', error);
        throw error;
    }
}
