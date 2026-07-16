"use server";

import { createClient } from '@/lib/supabase/server';
import { voucherSchema } from '../types/schemas/voucher';

export const getVouchers = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from('vouchers').select('*');
    if (error) throw error;
    return data;
}

export const getVoucherById = async (id: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase.from('vouchers').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
}

export const getVoucherByCode = async (code: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase.from('vouchers').select('*, catalog(*)').eq('code', code).single();
    if (error) return null;
    return data;
}

export const applyVoucher = async (code: string, userId: string, catalogId: string) => {
    const supabase = await createClient();

    // 1. Get Voucher
    const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .select('*, catalog(*)')
        .eq('code', code)
        .single();

    if (voucherError || !voucher) {
        throw new Error('Voucher tidak ditemukan atau tidak valid');
    }

    // 2. Check Catalog
    // If voucher has catalog relation/id and it doesn't match
    // Assuming catalog is a relation or catalog_id is the column. 
    // If catalog is fetched as object, we check its id.
    const voucherCatalogId = voucher.catalog?.id || voucher.catalog_id;

    if (voucherCatalogId && voucherCatalogId !== catalogId) {
        throw new Error('Voucher tidak dapat digunakan untuk katalog ini');
    }

    // 3. Check Usage
    if (voucher.is_per_user) {
        const { count, error: countError } = await supabase
            .from('user_vouchers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('voucher_id', voucher.id);

        if (countError) throw countError;

        if ((count || 0) >= voucher.limit) {
            throw new Error('Kamu sudah mencapai batas penggunaan voucher ini');
        }
    } else {
        const { count, error: countError } = await supabase
            .from('user_vouchers')
            .select('*', { count: 'exact', head: true })
            .eq('voucher_id', voucher.id);

        if (countError) throw countError;

        if ((count || 0) >= voucher.limit) {
            throw new Error('Voucher sudah tidak tersedia');
        }
    }

    return voucher;
}

export const createOrUpdate = async (model: any) => {
    try {
        const supabase = await createClient();

        const validatedData = voucherSchema.parse(model);

        const { data: result, error } = await supabase
            .from('vouchers')
            .upsert(validatedData)
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating/updating voucher:', error);
        throw error;
    }
}

export const deleteVoucher = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('vouchers')
            .update({ is_deleted: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting voucher:', error);
        throw error;
    }
}
