import z from "zod";

export const voucherApplicabilitySchema = z.object({
    id: z.string().optional(),
    voucher_id: z.string().nullable().optional(),
    catalog_id: z.string().nullable().optional(),
    apply_to_all: z.boolean(),

});

export type IVoucherApplicability = z.infer<typeof voucherApplicabilitySchema>;

export const defaultVoucherApplicability: IVoucherApplicability = {
    apply_to_all: false,
    catalog_id: null,
};
