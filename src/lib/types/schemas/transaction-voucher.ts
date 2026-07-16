import z from "zod";

export const transactionVoucherSchema = z.object({
    id: z.string().optional(),
    transaction_id: z.string().nullable().optional(),
    vouchers_id: z.string().nullable().optional(),
});

export type ITransactionVoucher = z.infer<typeof transactionVoucherSchema>;

export const defaultTransactionVoucher: ITransactionVoucher = {
    id: undefined,
    transaction_id: null,
    vouchers_id: null,
};
