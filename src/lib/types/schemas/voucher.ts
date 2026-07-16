import z from "zod";

export const voucherSchema = z.object({
    id: z.string().optional(),
    code: z.string(),
    name: z.string().optional(),
    discount_type: z.string(),
    discount_value: z.number().optional(),
    type: z.enum(["public", "private"]),
    is_enable: z.boolean(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    usage_limit: z.number().min(1),
    per_user_limit: z.number().min(1),
    is_deleted: z.boolean().optional(),
});

export const voucherApplicabilityInlineSchema = z.object({
    id: z.string().optional(),
    voucher_id: z.string().nullable().optional(),
    catalog_id: z.string().nullable().optional(),
    apply_to_all: z.boolean(),
});

export const voucherWithApplicabilitySchema = voucherSchema.extend({
    applicability: z.array(voucherApplicabilityInlineSchema),
}).refine((data) => {
    const firstRule = data.applicability[0];
    if (firstRule?.apply_to_all) {
        return true; // Valid if global
    }
    // If not global, must have at least one catalog selected
    return data.applicability.some(app => app.catalog_id !== null);
}, {
    message: "When 'Apply to All Costumes' is disabled, at least one catalog item must be selected",
    path: [], // Root level error
});

export type IVoucher = z.infer<typeof voucherSchema>;
export type IVoucherWithApplicability = z.infer<typeof voucherWithApplicabilitySchema>;

export const defaultVoucher: IVoucher = {
    code: "",
    name: "",
    discount_type: "percentage",
    discount_value: 0,
    type: "public",
    is_enable: false,
    usage_limit: 99999,
    per_user_limit: 1,
};

export const defaultVoucherWithApplicability: IVoucherWithApplicability = {
    ...defaultVoucher,
    applicability: [{
        apply_to_all: false,
        catalog_id: null,
    }],
};

export const defaultApplicabilityRule = {
    apply_to_all: false,
    catalog_id: null,
};
