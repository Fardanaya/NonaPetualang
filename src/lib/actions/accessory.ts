"use server";

import { createClient } from '@/lib/supabase/server';
import { accessorySchema } from "../types/schemas/accessory";

// Helper function to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export const createOrUpdateAccessory = async (model: any) => {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient();

        // Validate the model against the schema
        const validatedData = accessorySchema.parse(model);

        // Generate slug if not provided
        let slug = validatedData.slug;
        if (!slug && validatedData.name) {
            slug = generateSlug(validatedData.name);

            // Check if slug already exists
            const { data: existingAccessory } = await supabase
                .from('accessories')
                .select('id')
                .eq('slug', slug)
                .neq('id', validatedData.id || '')
                .single();

            // If slug exists, append counter
            if (existingAccessory) {
                let counter = 1;
                let newSlug = slug;
                while (existingAccessory) {
                    newSlug = `${slug}-${counter}`;
                    const { data: checkAccessory } = await supabase
                        .from('accessories')
                        .select('id')
                        .eq('slug', newSlug)
                        .neq('id', validatedData.id || '')
                        .single();
                    if (!checkAccessory) break;
                    counter++;
                }
                slug = newSlug;
            }
        }

        // Prepare the data for Supabase
        const dataToSave = {
            ...validatedData,
            slug,
        };

        // Create or update the accessory
        const { data: result, error } = await supabase
            .from('accessories')
            .upsert(dataToSave as any)
            .select()
            .single();

        if (error) throw error;

        return result;
    } catch (error) {
        console.error('Error creating/updating accessory:', error);
        throw error;
    }
}

export const deleteAccessory = async (id: string) => {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient();

        // Soft delete the accessory
        const { data, error } = await supabase
            .from('accessories')
            .update({ is_deleted: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting accessory:', error);
        throw error;
    }
}

export const getAccessoryById = async (id: string) => {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient();

        // Get the accessory by id
        const { data: accessory, error } = await supabase
            .from('accessories')
            .select(`
                *,
                catalog:catalog(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        return accessory;
    } catch (error) {
        console.error('Error fetching accessory by id:', error);
        throw error;
    }
}

export const getAccessoryBySlug = async (slug: string) => {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient();

        // Get the accessory by slug
        const { data: accessory, error } = await supabase
            .from('accessories')
            .select(`
                *,
                catalog:catalog(*)
            `)
            .eq('slug', slug)
            .eq('is_deleted', false)
            .single();

        if (error) throw error;

        return accessory;
    } catch (error) {
        console.error('Error fetching accessory by slug:', error);
        throw error;
    }
}

