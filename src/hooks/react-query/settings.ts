"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ISetting, defaultSetting } from "@/lib/types/schemas/setting";
import { updateSetting as updateSettingAction } from "@/lib/actions/settings";
import { displayToast } from "@/lib/utils";

export function useSettings() {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: settings } = await supabase
                .from("settings")
                .select("*");

            return settings as ISetting[];
        },
    });
}

export function useSettingByKey(key: string) {
    return useQuery({
        queryKey: ["settings", key],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: setting } = await supabase
                .from("settings")
                .select("*")
                .eq("key", key)
                .single();

            return setting ? Object.assign({}, defaultSetting, setting) as ISetting : defaultSetting;
        },
        enabled: !!key,
    });
}

export function useUpdateSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateSettingAction,
        onSuccess: (result) => {
            // Use setQueryData instead of invalidateQueries to prevent refetch
            // This ensures the text doesn't disappear after saving
            queryClient.setQueryData(["settings", result.key], result);
            queryClient.setQueryData(["settings"], (oldData: ISetting[] | undefined) => {
                if (!oldData) return [result];
                const index = oldData.findIndex(s => s.key === result.key);
                if (index >= 0) {
                    const newData = [...oldData];
                    newData[index] = result;
                    return newData;
                }
                return [...oldData, result];
            });
            displayToast({
                type: "success",
                title: "Berhasil",
                description: "Pengaturan berhasil disimpan"
            });
        },
        onError: () => {
            displayToast({
                type: "danger",
                title: "Error",
                description: "Gagal menyimpan pengaturan"
            });
        },
    });
}
