import z from "zod";

export const transactionSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),
    // catalog_id removed - now in transaction_items table
    address_id: z.string().optional(),
    deposit_id: z.string().optional(),
    dp_payment_id: z.string().optional(),
    payment_id: z.string().optional(),
    sett_payment_id: z.string().optional(),
    status: z.string().optional(),
    start_rent: z.string().optional(),
    end_rent: z.string().optional(),
    additional_day: z.number().optional(),
    total_price: z.number(),
    final_price: z.number(),
    cancel_reason: z.string().optional(),
    reject_reason: z.string().optional(),
    settlement_reason: z.string().optional(),
    is_deleted: z.boolean().optional(),

});


export type ITransaction = z.infer<typeof transactionSchema>;
