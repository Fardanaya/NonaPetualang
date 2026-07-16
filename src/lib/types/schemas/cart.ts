import z from "zod";

export const cartSchema = z.object({
    id: z.string().optional(),
    user_id: z.string(),
    item_type: z.enum(['catalog', 'accessory']),
    item_id: z.string(),
    rental_days: z.number().min(1).default(1),
    additional_days: z.number().min(0).default(0),
    start_date: z.string().optional(), // ISO date string
    selected_size: z.string().optional(),
    is_deleted: z.boolean().optional(),
});

export type ICart = z.infer<typeof cartSchema>;

export const defaultCart: ICart = {
    id: undefined,
    user_id: "",
    item_type: "catalog",
    item_id: "",
    rental_days: 1,
    additional_days: 0,
    start_date: undefined,
    selected_size: undefined,
    is_deleted: false,
};

// Extended cart item with joined data
export const cartItemSchema = cartSchema.extend({
    catalog: z.object({
        id: z.string(),
        name: z.string(),
        price_per_day: z.number(),
        prices: z.array(z.any()).optional(),
        images: z.array(z.string()).optional(),
        slug: z.string(),
    }).optional(),
    accessory: z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        price: z.number(),
        additional_day_price: z.number(),
        images: z.array(z.string()).optional(),
    }).optional(),
});

export type ICartItem = z.infer<typeof cartItemSchema>;
