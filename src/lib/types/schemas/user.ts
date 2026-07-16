import z from "zod";

export const userSchema = z.object({
    id: z.string().optional(),
    email: z.string(),
    name: z.string().optional(),
    full_name: z.string().optional(),
    phone_whatsapp: z.string().optional(),
    emergency_contact: z.string().optional(),
    identity_pict: z.string().optional(),
    blacklist_reason: z.string().optional(),
    total_rent: z.number().optional(),
    is_blacklist: z.boolean().optional(),
    is_admin: z.boolean().optional(),
    is_deleted: z.boolean().optional(),
});

export type IUser = z.infer<typeof userSchema>;

export const defaultUser: IUser = {
    id: undefined,
    email: '',
    name: '',
    full_name: '',
    phone_whatsapp: '',
    emergency_contact: '',
    identity_pict: '',
    blacklist_reason: '',
    total_rent: 0,
    is_blacklist: false,
    is_admin: false,
    is_deleted: false,
}
