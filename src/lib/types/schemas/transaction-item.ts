import z from "zod";

export const transactionItemSchema = z.object({
    id: z.string().optional(),
    transaction_id: z.string(),
    item_type: z.enum(["catalog", "accessory"]),
    item_id: z.string(),
    selected_size: z.string().optional(),
    rental_days: z.number().default(3),
    additional_days: z.number().default(0),
    price: z.number().default(0),
    is_deleted: z.boolean().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type ITransactionItem = z.infer<typeof transactionItemSchema>;
