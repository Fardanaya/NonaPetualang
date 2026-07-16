import z from "zod";

export const addOnSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required").optional(),
    price: z.number(),
    stock: z.number().optional(),
    image: z.string().optional(),
    is_deleted: z.boolean().optional(),
});

export type IAddOn = z.infer<typeof addOnSchema>;

export const defaultAddOn: IAddOn = {
    id: undefined,
    image: '',
    name: '',
    price: 0,
    stock: 0,
    is_deleted: false,
};
