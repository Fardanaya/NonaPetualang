import z from "zod";

export const bundleItemSchema = z.object({
    id: z.string().optional(),
    bundle_id: z.string().optional(),
    costume_id: z.string().optional(),
});

export type IBundleItem = z.infer<typeof bundleItemSchema>;
