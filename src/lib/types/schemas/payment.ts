import z from "zod";

export const paymentSchema = z.object({
    id: z.string().optional(),
    transaction_id: z.string().optional(),
    nominal: z.number().optional(),
    proof: z.string().optional(),
    payment_method: z.string().optional(),
    status: z.string().optional(),
    type: z.enum(['dp', 'full', 'settlement']).optional(),
    midtrans_order_id: z.string().optional(),
    snap_token: z.string().optional(),
    is_deleted: z.boolean().optional(),
});

export type IPayment = z.infer<typeof paymentSchema>;

