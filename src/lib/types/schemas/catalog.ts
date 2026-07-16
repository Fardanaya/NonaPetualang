import z from "zod";
import type { IBrand } from "./brand";
import type { ICategory } from "./category";

export const catalogSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    catalog_type: z.string().optional(),
    category_id: z.union([z.object({ id: z.string().nullable() }), z.null()]).optional(),
    price_per_day: z.number().optional(),
    prices: z.array(z.object({
        days: z.number(),
        price: z.number()
    })).optional(),
    status: z.string().optional(),
    capacity: z.number().optional(),
    capacity_unit: z.string().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
    length: z.number().optional(),
    important_info: z.string().optional(),
    images: z.array(z.string()).optional(),
    brand_id: z.union([z.object({ id: z.string().nullable() }), z.null()]).optional(),
    slug: z.string().optional(),
    bundle_catalog: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    is_deleted: z.boolean().optional(),
});

export type ICatalog = z.infer<typeof catalogSchema>;

export type ICatalogWithRelations = ICatalog & {
    brand: IBrand | null;
    category: any | null;
};

export const createDefaultCatalog = (): ICatalog => {
    return {
        id: undefined,
        name: "",
        description: "",
        catalog_type: "alat",
        price_per_day: 0,
        prices: [],
        status: "",
        capacity: 1,
        capacity_unit: "orang",
        weight: 0,
        height: 0,
        width: 0,
        length: 0,
        important_info: "",
        images: [],
        brand_id: null,
        category_id: null,
        slug: "",
        bundle_catalog: [],
        tags: [],
        is_deleted: false,
    } as ICatalog;
};

// Default catalog
export const defaultCatalog = createDefaultCatalog();
