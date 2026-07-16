import z from "zod";

export const rentScheduleSchema = z.object({
    id: z.string().optional(),
    transaction_id: z.string().nullable().optional(),
    catalog_id: z.string().nullable().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_deleted: z.boolean().optional(),
});

export type IRentSchedule = z.infer<typeof rentScheduleSchema>;

export const defaultRentSchedule: IRentSchedule = {
    id: undefined,
    transaction_id: null,
    catalog_id: null,
    start_date: "",
    end_date: "",
    is_deleted: false,
};
