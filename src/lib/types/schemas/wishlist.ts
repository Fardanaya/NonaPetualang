import z from "zod";

export const wishlistSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),
    wishlist_name: z.string().min(1, "Name is required"),
    date: z.string().optional(),
    is_deleted: z.boolean().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type IWishlist = z.infer<typeof wishlistSchema>;

// export const defaultAddOn: IWishlist = {
//     id: undefined,
//     wishlist_name: '',
//     user_id: undefined,
//     is_deleted: false,
// };
