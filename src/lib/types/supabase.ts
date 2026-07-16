// Supabase Database Types for Cloudyrent
// Using Zod schemas for validation and type inference
// Schemas are separated into individual files

import { brandSchema, type IBrand, defaultBrand } from "./schemas/brand";
import { catalogSchema, type ICatalog, createDefaultCatalog, defaultCatalog } from "./schemas/catalog";
import { addOnSchema, type IAddOn } from "./schemas/add-on";
import { bundleItemSchema, type IBundleItem } from "./schemas/bundle-item";
import { voucherSchema, type IVoucher } from "./schemas/voucher";
import { addressSchema, type IAddress, defaultAddress } from "./schemas/address";
import { transactionSchema, type ITransaction } from "./schemas/transaction";
import { transactionItemSchema, type ITransactionItem } from "./schemas/transaction-item";
import { transactionAddonSchema, type ITransactionAddon } from "./schemas/transaction-addon";
import { paymentSchema, type IPayment } from "./schemas/payment";
import { shippingSchema, type IShipping } from "./schemas/shipping";
import { penaltySchema, type IPenalty } from "./schemas/penalty";
import { waitingListSchema, type IWaitingList } from "./schemas/waiting-list";
import { wishlistSchema, type IWishlist } from "./schemas/wishlist";
import { settingSchema, type ISetting } from "./schemas/setting";
import { userSchema, type IUser } from "./schemas/user";

// Database type union including all schemas
export const databaseSchemas = {
    users: userSchema,
    brands: brandSchema,
    catalog: catalogSchema,
    add_ons: addOnSchema,
    bundle_items: bundleItemSchema,
    vouchers: voucherSchema,
    payments: paymentSchema,
    shipping: shippingSchema,
    addresses: addressSchema,
    transactions: transactionSchema,
    transaction_items: transactionItemSchema,
    transaction_addons: transactionAddonSchema,
    penalties: penaltySchema,
    waiting_list: waitingListSchema,
    wishlist: wishlistSchema,
    settings: settingSchema,
} as const;

// Simplified Database interface for Supabase client
export interface Database {
    public: {
        Tables: {
            users: {
                Row: IUser
                Insert: Omit<IUser, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<IUser, 'id' | 'created_at' | 'updated_at'>>
            }
            brands: {
                Row: IBrand
                Insert: Omit<IBrand, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<IBrand, 'id' | 'created_at' | 'updated_at'>>
            }
            catalog: {
                Row: ICatalog
                Insert: Omit<ICatalog, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<ICatalog, 'id' | 'created_at' | 'updated_at'>>
            }
            add_ons: {
                Row: IAddOn
                Insert: Omit<IAddOn, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<IAddOn, 'id' | 'created_at' | 'updated_at'>>
            }
            bundle_items: {
                Row: IBundleItem
                Insert: Omit<IBundleItem, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<IBundleItem, 'id' | 'created_at' | 'updated_at'>>
            }
            vouchers: {
                Row: IVoucher
                Insert: Omit<IVoucher, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<IVoucher, 'id' | 'created_at' | 'updated_at'>>
            }
            payments: {
                Row: IPayment
                Insert: Omit<IPayment, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<IPayment, 'id' | 'created_at' | 'updated_at'>>
            }
            shipping: {
                Row: IShipping
                Insert: Omit<IShipping, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<IShipping, 'id' | 'created_at' | 'updated_at'>>
            }
            addresses: {
                Row: IAddress
                Insert: Omit<IAddress, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<IAddress, 'id' | 'created_at' | 'updated_at'>>
            }
            transactions: {
                Row: ITransaction
                Insert: Omit<ITransaction, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<ITransaction, 'id' | 'created_at' | 'updated_at'>>
            }
            transaction_items: {
                Row: ITransactionItem
                Insert: Omit<ITransactionItem, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<ITransactionItem, 'id' | 'created_at' | 'updated_at'>>
            }
            transaction_addons: {
                Row: ITransactionAddon
                Insert: Omit<ITransactionAddon, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<ITransactionAddon, 'id' | 'created_at' | 'updated_at'>>
            }
            penalties: {
                Row: IPenalty
                Insert: Omit<IPenalty, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<IPenalty, 'id' | 'created_at' | 'updated_at'>>
            }
            waiting_list: {
                Row: IWaitingList
                Insert: Omit<IWaitingList, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<IWaitingList, 'id' | 'created_at' | 'updated_at'>>
            }
            wishlist: {
                Row: IWishlist
                Insert: Omit<IWishlist, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<IWishlist, 'id' | 'created_at' | 'updated_at'>>
            }
            settings: {
                Row: ISetting
                Insert: Omit<ISetting, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<ISetting, 'id' | 'created_at' | 'updated_at'>>
            }
        }
    }
}
