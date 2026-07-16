"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IUser, defaultUser } from "@/lib/types/schemas/user";
import { usePaginatedUsers as useUniversalPaginatedUsers } from "./pagination";
import { createOrUpdate as createOrUpdateUserAction, deleteUser as deleteUserAction } from "@/lib/actions/user";
import { displayToast } from "@/lib/utils";

export function useUser() {
    return useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data } = await supabase.auth.getSession();

            if (data.session?.user) {
                // Fetch user information from public.users table
                const { data: user } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", data.session.user.id)
                    .single();

                return user ? Object.assign({}, defaultUser, user) as IUser : defaultUser;
            }
            return defaultUser;
        },
    });
}

export function useUserById(id?: string) {
    return useQuery({
        queryKey: ["user", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: user } = await supabase
                .from("users")
                .select("*")
                .eq("id", id)
                .single();

            return user ? Object.assign({}, defaultUser, user) as IUser : null;
        },
        enabled: !!id,
    });
}

export function useAllUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            console.log("Testing simple users query...");
            const supabase = supabaseClient();

            // First test basic connection
            const { data: session, error: sessionError } = await supabase.auth.getSession();
            console.log("Session test:", sessionError ? sessionError : "OK");

            if (sessionError) {
                throw sessionError;
            }

            // Test simple users query
            console.log("Executing users query...");
            const { data: users, error: usersError } = await supabase
                .from("users")
                .select("*")
                .limit(5); // Limit to 5 for testing

            console.log("Users query result:", { users, error: usersError });

            if (usersError) {
                console.error("Users query failed:", usersError);
                throw usersError;
            }

            return users as IUser[];
        },
    });
}

export function useCreateOrUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createOrUpdateUserAction,
        onSuccess: (result, variables) => {
            // Invalidate all users list queries and the single user queries
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });
            if (variables?.id) {
                queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
            }

            const isUpdate = variables?.id !== undefined && variables?.id !== null;
            displayToast({
                type: "success",
                title: "Success",
                description: `User ${isUpdate ? "updated" : "created"} successfully`
            })
        },
        onError: (error: any) => {
            displayToast({
                type: "danger",
                title: "Error",
                description: error?.message || "Failed to update user"
            });
        },
    })
}

// Re-export the universal paginated users hook with proper typing
export function usePaginatedUsers(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return useUniversalPaginatedUsers<IUser>(options);
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUserAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            displayToast({
                type: "success",
                title: "Success",
                description: "User deleted successfully"
            });
        },
        onError: (error: any) => {
            displayToast({
                type: "danger",
                title: "Error",
                description: error?.message || "Failed to delete user"
            });
        },
    });
}

export function useToggleAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, isAdmin }: { id: string; isAdmin: boolean }) => {
            return createOrUpdateUserAction({ id, is_admin: isAdmin });
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
            displayToast({
                type: "success",
                title: "Success",
                description: `User ${variables.isAdmin ? 'granted' : 'revoked'} admin rights`
            });
        },
        onError: (error: any) => {
            displayToast({
                type: "danger",
                title: "Error",
                description: error?.message || "Failed to update admin status"
            });
        },
    });
}

export function useToggleBlacklist() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, isBlacklist, reason }: { id: string; isBlacklist: boolean; reason?: string }) => {
            return createOrUpdateUserAction({ id, is_blacklist: isBlacklist, blacklist_reason: reason });
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
            displayToast({
                type: "success",
                title: "Success",
                description: `User ${variables.isBlacklist ? 'added to' : 'removed from'} blacklist`
            });
        },
        onError: (error: any) => {
            displayToast({
                type: "danger",
                title: "Error",
                description: error?.message || "Failed to update blacklist status"
            });
        },
    });
}
