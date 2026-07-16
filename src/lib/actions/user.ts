"use server";

import { createClient } from '@/lib/supabase/server';

export const createOrUpdate = async (model: any) => {
    try {
        const supabase = await createClient();

        // Get session user id from server session if available
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        // Note: Using getUser() verifies the auth data with the auth server rather than just reading cookies.
        console.log("[createOrUpdate user] session user id:", userId, "incoming model id:", model.id);

        // Enforce server-side id to match the authenticated user to avoid RLS insert violations
        // UNLESS the user is an admin
        if (userId) {
            const { data: currentUser } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', userId)
                .single();

            const isAdmin = currentUser?.is_admin || false;

            if (!isAdmin) {
                model.id = userId; // always enforce id from session for non-admins
            }
            // If admin, we trust the model.id (or default to userId if not provided)
            if (isAdmin && !model.id) {
                model.id = userId;
            }
        }

        // Filter model to only allowed user columns (prevent PostgREST schema errors)
        const allowedFields = [
            'id', 'email', 'name', 'full_name', 'phone_whatsapp', 'emergency_contact',
            'identity_pict', 'blacklist_reason', 'total_rent', 'is_blacklist', 'is_admin', 'is_deleted'
        ];
        const payloadToPersist: any = {};
        allowedFields.forEach((k) => {
            if (Object.prototype.hasOwnProperty.call(model, k)) {
                payloadToPersist[k] = model[k];
            }
        });

        // Log payload for debugging
        console.log('[createOrUpdate user] payloadToPersist:', payloadToPersist);

        // Prefer update if the user already exists; avoid upsert to prevent INSERTs that violate RLS
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', payloadToPersist.id)
            .single();

        let result: any, error: any;
        if (existingUser) {
            console.log("[createOrUpdate user] updating existing user", payloadToPersist.id);
            ({ data: result, error } = await supabase
                .from('users')
                .update(payloadToPersist)
                .eq('id', payloadToPersist.id)
                .select()
                .single());
        } else {
            console.log("[createOrUpdate user] inserting new user", payloadToPersist.id);
            ({ data: result, error } = await supabase
                .from('users')
                .insert(payloadToPersist)
                .select()
                .single());
        }

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating/updating user:', error);
        throw error;
    }
}

export const deleteUser = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await (supabase
            .from('users') as any)
            .update({ is_deleted: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}
