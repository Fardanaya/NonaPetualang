import z from "zod";

export const brandSchema = z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().optional(),
    logo_url: z.string().optional(),
});

export type IBrand = z.infer<typeof brandSchema>;

export const defaultBrand: IBrand = {
    id: undefined,
    name: "",
    description: "",
    logo_url: "",
};
