import z from "zod";

export const categorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    icon_url: z.string().optional(),
});

export type ICategory = z.infer<typeof categorySchema>;

export const defaultCategory: ICategory = {
    id: undefined,
    name: "",
    description: "",
    icon_url: "",
};
