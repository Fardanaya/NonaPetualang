import z from "zod";
import { wishlistSchema } from "./wishlist";

export const wishlistItemsSchema = z.object({
    id: z.string().optional(),
    wishlist_id: z.string().nullable().optional(),
    catalog_id: z.string().nullable().optional(),
    is_deleted: z.boolean().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type IWishlistItems = z.infer<typeof wishlistItemsSchema>;

export interface IWishlistCardProps {
    wishlist: {
        id: string;
        wishlist_name: string;
        date?: string;
        wishlist_items?: Array<{
            catalog: {
                id: string;
                name: string;
                images?: string[];
            };
        }>;
    };
    onEdit?: (wishlist: any) => void;
}
