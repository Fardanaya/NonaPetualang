import z from "zod";

// Type enum
export const paymentMethodTypes = ["Bank Transfer", "E-Wallet", "QRIS"] as const;

export const paymentMethodSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required").refine(val => paymentMethodTypes.includes(val as any), { message: "Invalid type" }),
    number: z.string().nullable().optional(),
    holder: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    is_deleted: z.boolean().optional(),
});

export type IPaymentMethod = z.infer<typeof paymentMethodSchema>;

export const defaultPaymentMethod: IPaymentMethod = {
    id: undefined,
    name: "",
    type: "Bank Transfer",
    number: "",
    holder: "",
    image: "",
    is_deleted: false,
};
