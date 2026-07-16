import z from "zod";

export const shippingSchema = z.object({
    id: z.string().optional(),
    resi: z.string().optional(),
    price: z.number().optional(),
    expedition: z.string().nullable().optional(), // Expedition ID (e.g., 'jne', 'jnt', 'sicepat')
    is_deleted: z.boolean().optional(),
});

export type IShipping = z.infer<typeof shippingSchema>;
