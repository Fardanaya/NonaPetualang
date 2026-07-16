import z from "zod";

export const userVoucherSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().nullable().optional(),
    vouchers_id: z.string().nullable().optional(),
    usage_count: z.number().optional().default(0),
});

export type IUserVoucher = z.infer<typeof userVoucherSchema>;

export const defaultUserVoucher: IUserVoucher = {
    id: undefined,
    user_id: null,
    vouchers_id: null,
    usage_count: 0,
};
