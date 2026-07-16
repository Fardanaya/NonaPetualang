import z from "zod";

export const transactionAddonSchema = z.object({
    id: z.string().optional(),
    transaction_id: z.string().optional(),
    add_on_id: z.string().optional(),
    price: z.number().optional(),
    qty: z.number().optional(),
    is_deleted: z.boolean().optional(),

});

export type ITransactionAddon = z.infer<typeof transactionAddonSchema>;
