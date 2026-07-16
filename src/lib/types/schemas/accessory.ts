import z from "zod";
import type { ICatalog } from "./catalog";

export const accessorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    slug: z.string().optional(),
    description: z.string().optional(),
    price: z.number(),
    images: z.array(z.string()).optional(),
    catalog_id: z.string().nullable().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
    length: z.number().optional(),
    important_info: z.string().optional(),
    type: z.enum(["accessories", "weapon", "shoes"]),
    additional_day_price: z.number().min(0, "Additional day price cannot be negative"),
    is_deleted: z.boolean().optional(),
});

export type IAccessory = z.infer<typeof accessorySchema>;

export type IAccessoryWithRelations = IAccessory & {
    catalog: ICatalog | null;
};

export const createDefaultAccessory = (): IAccessory => {
    return {
        id: undefined,
        name: "",
        slug: "",
        description: "",
        price: 0,
        images: [],
        catalog_id: null,
        weight: 0,
        height: 0,
        width: 0,
        length: 0,
        important_info: "",
        type: "accessories",
        additional_day_price: 0,
        is_deleted: false,
    } as IAccessory;
};

// Default accessory
export const defaultAccessory = createDefaultAccessory();

