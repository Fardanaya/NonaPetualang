import z from "zod";

export const waitingListSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),
    catalog_id: z.string().optional(),
    payment_id: z.string().optional(),
    queue: z.number().optional(),
    is_deleted: z.boolean().optional(),

});

export type IWaitingList = z.infer<typeof waitingListSchema>;
