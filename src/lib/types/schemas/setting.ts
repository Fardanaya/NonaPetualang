import { z } from "zod";

export const settingSchema = z.object({
    id: z.string().uuid().optional(),
    key: z.string(),
    value: z.string().nullable().optional(),
    visible: z.boolean().default(false),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type ISetting = z.infer<typeof settingSchema>;

export const defaultSetting: ISetting = {
    id: undefined,
    key: "",
    value: "",
    visible: false,
};
