import z from "zod";

export const addressSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),
    label: z.string().optional(),
    address: z.string().optional(), // alamat rumah / jalan
    address_details: z.string().optional(), // patokan
    receiver: z.string().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    sub_district_id: z.number().nullable().optional(), // ID kelurahan dari API
    province: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    district: z.string().nullable().optional(), // kecamatan
    sub_district: z.string().nullable().optional(), // kelurahan
    postal_code: z.string().nullable().optional(),
    is_deleted: z.boolean().optional(),
});

export type IAddress = z.infer<typeof addressSchema>;

export const defaultAddress: IAddress = {
    id: undefined,
    user_id: "",
    label: "",
    address: "",
    address_details: "",
    receiver: "",
    latitude: undefined,
    longitude: undefined,
    sub_district_id: undefined,
    province: undefined,
    city: undefined,
    district: undefined,
    sub_district: undefined,
    postal_code: undefined,
    is_deleted: false,
};
