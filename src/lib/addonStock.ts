"use server";

import { createClient } from '@/lib/supabase/server';

export const restoreAddOnStock = async (addons: { id: string; quantity: number }[]) => {
    try {
        const supabase = await createClient();

        for (const addon of addons) {
            if (!addon.id || addon.quantity <= 0) continue;

            // Get current stock
            const { data: currentAddon, error: fetchError } = await supabase
                .from('add_ons')
                .select('stock')
                .eq('id', addon.id)
                .single();

            if (fetchError) {
                console.error(`Error fetching addon ${addon.id}:`, fetchError);
                continue;
            }

            const newStock = (currentAddon?.stock || 0) + addon.quantity;

            // Update stock
            const { error: updateError } = await supabase
                .from('add_ons')
                .update({ stock: newStock })
                .eq('id', addon.id);

            if (updateError) {
                console.error(`Error updating stock for addon ${addon.id}:`, updateError);
            }
        }
    } catch (error) {
        console.error('Error restoring addon stock:', error);
        throw error;
    }
};
