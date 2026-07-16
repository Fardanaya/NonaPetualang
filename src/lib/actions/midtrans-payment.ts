"use server";

import { createClient } from '@/lib/supabase/server';

interface CreatePendingPaymentParams {
    transaction_id: string;
    nominal: number;
    type: 'dp' | 'full' | 'settlement';
    midtrans_order_id: string;
    snap_token?: string;
}

interface CreatePaymentOnSuccessParams {
    transaction_id: string;
    nominal: number;
    type: 'dp' | 'full' | 'settlement';
    midtrans_order_id: string;
    payment_method: string;
    proof: string;
}

interface UpdatePaymentParams {
    id: string;
    status: string;
    payment_method?: string;
    proof?: string;
}

interface UpdatePaymentOnSuccessParams {
    id: string;
    status: string;
    payment_method: string;
    proof: string;
    midtrans_order_id: string;
    nominal?: number;
}

interface UpdateTransactionPaymentParams {
    transaction_id: string;
    payment_id: string;
    payment_type: 'dp' | 'full' | 'settlement';
}

// Create payment record only after successful Midtrans payment
export async function createPaymentOnSuccess(params: CreatePaymentOnSuccessParams) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('payments')
        .insert({
            transaction_id: params.transaction_id,
            nominal: params.nominal,
            type: params.type,
            midtrans_order_id: params.midtrans_order_id,
            payment_method: params.payment_method,
            proof: params.proof,
            status: 'paid',
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating payment on success:", error);
        throw error;
    }

    return data;
}

// Get existing pending payment for a transaction (within 24 hours - Midtrans expiry)
export async function getExistingPendingPayment(transaction_id: string, type: 'dp' | 'full' | 'settlement') {
    const supabase = await createClient();

    // Calculate 24 hours ago (Midtrans default expiry time)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_id', transaction_id)
        .eq('type', type)
        .eq('status', 'pending')
        .gte('xata.createdAt', twentyFourHoursAgo)
        .order('xata.createdAt', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error getting existing payment:", error);
        return null;
    }

    return data;
}

export async function createPendingPayment(params: CreatePendingPaymentParams) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('payments')
        .insert({
            transaction_id: params.transaction_id,
            nominal: params.nominal,
            type: params.type,
            midtrans_order_id: params.midtrans_order_id,
            snap_token: params.snap_token,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating pending payment:", error);
        throw error;
    }

    return data;
}

// Update snap token for existing payment
export async function updatePaymentSnapToken(id: string, snap_token: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('payments')
        .update({ snap_token })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Error updating snap token:", error);
        throw error;
    }

    return data;
}

export async function updatePaymentStatus(params: UpdatePaymentParams) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('payments')
        .update({
            status: params.status,
            payment_method: params.payment_method,
            proof: params.proof,
        })
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        console.error("Error updating payment:", error);
        throw error;
    }

    return data;
}

export async function updatePaymentOnSuccess(params: UpdatePaymentOnSuccessParams) {
    const supabase = await createClient();

    const updatePayload: any = {
        status: params.status,
        payment_method: params.payment_method,
        proof: params.proof,
        midtrans_order_id: params.midtrans_order_id,
    };

    if (params.nominal !== undefined) {
        updatePayload.nominal = params.nominal;
    }

    const { data, error } = await supabase
        .from('payments')
        .update(updatePayload)
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        console.error("Error updating payment on success:", error);
        throw error;
    }

    return data;
}

export async function updateTransactionPayment(params: UpdateTransactionPaymentParams) {
    const supabase = await createClient();

    const updateData: any = {};

    if (params.payment_type === 'full') {
        updateData.status = 'paid';
        updateData.payment_id = params.payment_id;
    } else if (params.payment_type === 'dp') {
        updateData.status = 'dp';
        updateData.dp_payment_id = params.payment_id;
    } else if (params.payment_type === 'settlement') {
        updateData.status = 'done';
        updateData.sett_payment_id = params.payment_id;
    }

    const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', params.transaction_id)
        .select()
        .single();

    if (error) {
        console.error("Error updating transaction:", error);
        throw error;
    }

    return data;
}
