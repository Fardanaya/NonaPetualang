"use server";

import { createClient } from '@/lib/supabase/server';

export const addToCart = async (model: {
    item_type: 'catalog' | 'accessory';
    item_id: string;
    rental_days?: number;
    additional_days?: number;
    start_date?: string;
    selected_size?: string;
}) => {
    try {
        const supabase = await createClient();
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error('User not authenticated');

        // Check if item already exists in cart
        const { data: existingItem } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', user.data.user.id)
            .eq('item_type', model.item_type)
            .eq('item_id', model.item_id)
            .eq('is_deleted', false)
            .single();

        if (existingItem) {
            // Item already exists in cart, just return it
            return existingItem;
        }

        // Insert new item
        const { data, error } = await supabase
            .from('carts')
            .insert({
                user_id: user.data.user.id,
                item_type: model.item_type,
                item_id: model.item_id,
                rental_days: model.rental_days || 1,
                additional_days: model.additional_days || 0,
                start_date: model.start_date ? new Date(model.start_date).toISOString() : null,
                selected_size: model.selected_size,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
}

export const updateCartItem = async (id: string, updates: Partial<{
    rental_days: number;
    additional_days: number;
    start_date: string;
    selected_size: string;
}>) => {
    try {
        const supabase = await createClient();

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (updates.rental_days !== undefined) updateData.rental_days = updates.rental_days;
        if (updates.additional_days !== undefined) updateData.additional_days = updates.additional_days;
        if (updates.start_date !== undefined) updateData.start_date = updates.start_date ? new Date(updates.start_date).toISOString() : null;
        if (updates.selected_size !== undefined) updateData.selected_size = updates.selected_size;

        const { data, error } = await supabase
            .from('carts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
    }
}

export const removeFromCart = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('carts')
            .update({ is_deleted: true, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
}

export const clearUserCart = async () => {
    try {
        const supabase = await createClient();
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('carts')
            .update({ is_deleted: true, updated_at: new Date().toISOString() })
            .eq('user_id', user.data.user.id)
            .select();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
}
