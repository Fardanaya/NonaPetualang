import z from "zod";

export const tagSchema = z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Name is required"),
    type: z.string().optional(),
});

export type ITag = z.infer<typeof tagSchema>;

export const defaultTag: ITag = {
    id: undefined,
    name: "",
    type: "",
};
