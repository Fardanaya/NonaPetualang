"use server";

import { createClient } from '@/lib/supabase/server';

export const getTransactions = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*, transaction_items(*), user:users(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return await enrichTransactionsWithCatalog(supabase, data);
};

export const getTransactionById = async (id: string) => {
  try {
    const supabase = await createClient();

    // Get basic transaction data first
    const { data, error } = await supabase
      .from('transactions')
      .select('*, transaction_items(*), user:users(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }

    // Fetch address data separately
    if (data.address_id && typeof data.address_id === 'string') {
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', data.address_id)
        .single();
      if (addressData) data.address = addressData;
    }

    // Fetch payment data separately
    if (data.deposit && typeof data.deposit === 'string') {
      const { data: deposit } = await supabase.from('payments').select('*').eq('id', data.deposit).single();
      if (deposit) data.deposit = deposit;
    }

    if (data.dp_payment_id && typeof data.dp_payment_id === 'string') {
      const { data: dpPayment } = await supabase.from('payments').select('*').eq('id', data.dp_payment_id).single();
      if (dpPayment) data.dp_payment = dpPayment;
    }

    if (data.payment && typeof data.payment === 'string') {
      const { data: payment } = await supabase.from('payments').select('*').eq('id', data.payment).single();
      if (payment) data.payment = payment;
    }

    if (data.sett_payment_id && typeof data.sett_payment_id === 'string') {
      const { data: settPayment } = await supabase.from('payments').select('*').eq('id', data.sett_payment_id).single();
      if (settPayment) data.sett_payment = settPayment;
    }

    // Fetch penalty data
    const { data: penalty } = await supabase
      .from('penalties')
      .select('*')
      .eq('transaction_id', id)
      .eq('is_deleted', false)
      .maybeSingle();
    if (penalty) data.penalty = penalty;

    const enriched = await enrichTransactionsWithCatalog(supabase, [data]);
    return enriched[0];
  } catch (error) {
    console.error('getTransactionById error:', error);
    throw error;
  }
};

export const getTransactionsByUser = async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*, transaction_items(*), user:users(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return await enrichTransactionsWithCatalog(supabase, data);
};

export const getTransactionsByCatalog = async (catalogId: string) => {
  const supabase = await createClient();
  // Find transaction IDs from transaction_items
  const { data: items, error: itemsError } = await supabase
    .from('transaction_items')
    .select('transaction_id')
    .eq('item_id', catalogId)
    .eq('item_type', 'catalog');

  if (itemsError) throw itemsError;

  const transactionIds = items.map(i => i.transaction_id);

  if (transactionIds.length === 0) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select('*, transaction_items(*), user:users(*)')
    .in('id', transactionIds)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return await enrichTransactionsWithCatalog(supabase, data);
};

const enrichTransactionsWithCatalog = async (supabase: any, transactions: any[]) => {
  if (!transactions || transactions.length === 0) return transactions;

  // Get all catalog IDs from transaction items
  const catalogIds = transactions
    .flatMap((t: any) => t.transaction_items || [])
    .filter((item: any) => item.item_type === 'catalog')
    .map((item: any) => item.item_id);

  // Get all accessory IDs from transaction items
  const accessoryIds = transactions
    .flatMap((t: any) => t.transaction_items || [])
    .filter((item: any) => item.item_type === 'accessory')
    .map((item: any) => item.item_id);

  let catalogMap = new Map();
  let accessoryMap = new Map();

  // Fetch catalogs if any
  if (catalogIds.length > 0) {
    const uniqueCatalogIds = [...new Set(catalogIds)];

    const { data: catalogs } = await supabase
      .from('catalog')
      .select(`
        *,
        category:category_id (*),
        brands:brand_id (*)
      `)
      .in('id', uniqueCatalogIds);

    catalogMap = new Map(catalogs?.map((c: any) => [c.id, c]));
  }

  // Fetch accessories if any
  if (accessoryIds.length > 0) {
    const uniqueAccessoryIds = [...new Set(accessoryIds)];

    const { data: accessories } = await supabase
      .from('accessories')
      .select('*')
      .in('id', uniqueAccessoryIds);

    accessoryMap = new Map(accessories?.map((a: any) => [a.id, a]));
  }

  // Assign items to transactions
  transactions.forEach((t: any) => {
    // Get ALL catalog items (not just the first one)
    const catalogItems = t.transaction_items?.filter((i: any) => i.item_type === 'catalog') || [];
    t.catalogs = catalogItems.map((item: any) => ({
      ...catalogMap.get(item.item_id),
      selected_size: item.selected_size,
      rental_days: item.rental_days,
      additional_days: item.additional_days,
      price: item.price,
    })).filter(Boolean);

    // Keep backward compatibility - set single catalog to first item
    if (t.catalogs.length > 0) {
      t.catalog = t.catalogs[0];
    }

    // Get ALL accessory items
    const accessoryItems = t.transaction_items?.filter((i: any) => i.item_type === 'accessory') || [];
    t.accessories = accessoryItems.map((item: any) => ({
      ...accessoryMap.get(item.item_id),
      rental_days: item.rental_days,
      additional_days: item.additional_days,
      price: item.price,
      catalog_id: item.catalog_id,
    })).filter(Boolean);
  });

  return transactions;
}

export const createOrUpdateTransaction = async (model: any) => {
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from('transactions')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating transaction:', error);
    throw error;
  }
}

export const deleteTransaction = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('transactions')
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

export const updateTransactionStatusBulk = async (catalogId: string, oldStatus: string, newStatus: string) => {
  const supabase = await createClient();

  // 1. Get transaction IDs for catalog
  const { data: items, error: itemsError } = await supabase
    .from('transaction_items')
    .select('transaction_id')
    .eq('item_id', catalogId)
    .eq('item_type', 'catalog');

  if (itemsError) throw itemsError;
  const transactionIds = items.map(i => i.transaction_id);

  if (transactionIds.length === 0) return { success: true, updatedCount: 0 };

  // 2. Update transactions
  const { data, error } = await supabase
    .from('transactions')
    .update({ status: newStatus })
    .in('id', transactionIds)
    .eq('status', oldStatus)
    .select();

  if (error) throw error;
  return { success: true, updatedCount: data?.length || 0, data };
}

export const getBookedDatesForCatalogItems = async (catalogIds: string[]) => {
  if (!catalogIds || catalogIds.length === 0) return [];

  const supabase = await createClient();
  // Statuses that indicate the item is booked/unavailable
  const bookedStatuses = ['pending', 'waiting', 'dp', 'paid', 'sending', 'returning', 'settlement'];

  const { data, error } = await supabase
    .from("transaction_items")
    .select(`
          item_id,
          item_type,
          transaction:transaction_id (
              id,
              start_rent,
              end_rent,
              status
          )
      `)
    .eq('item_type', 'catalog')
    .in('item_id', catalogIds);

  if (error) {
    console.error('Error fetching booked dates:', error);
    return [];
  }

  return data
    ?.map((item: any) => item.transaction)
    .filter((t: any) => t && bookedStatuses.includes(t.status)) || [];
};

export const getBookedDatesForAccessoryItems = async (accessoryIds: string[]) => {
  if (!accessoryIds || accessoryIds.length === 0) return [];

  const supabase = await createClient();
  // Statuses that indicate the item is booked/unavailable
  const bookedStatuses = ['pending', 'waiting', 'dp', 'paid', 'sending', 'returning', 'settlement'];

  const { data, error } = await supabase
    .from("transaction_items")
    .select(`
          item_id,
          item_type,
          transaction:transaction_id (
              id,
              start_rent,
              end_rent,
              status
          )
      `)
    .eq('item_type', 'accessory')
    .in('item_id', accessoryIds);

  if (error) {
    console.error('Error fetching booked dates for accessories:', error);
    return [];
  }

  return data
    ?.map((item: any) => item.transaction)
    .filter((t: any) => t && bookedStatuses.includes(t.status)) || [];
};
