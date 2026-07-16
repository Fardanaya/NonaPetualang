import z from "zod";

export const penaltySchema = z.object({
    id: z.string().optional(),
    transaction_id: z.string().optional(),
    details: z.string().optional(),
    image: z.string().optional(),
    price: z.number(),
    is_deleted: z.boolean().optional(),

});

export type IPenalty = z.infer<typeof penaltySchema>;
