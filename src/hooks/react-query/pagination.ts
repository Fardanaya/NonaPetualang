import { supabaseClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Generic pagination options interface
export interface UsePaginatedQueryOptions<T> {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    searchFields?: string[];
    orderBy?: string;
    orderDirection?: "asc" | "desc";
    additionalFilters?: Record<string, any>;
    enabled?: boolean;
    requireAuth?: boolean;
    transformData?: (data: any[]) => T[];
    select?: string; // Add select option for custom selects including joins
}

// Generic paginated response interface
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        totalRecords: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };

}

// Main generic paginated query hook
export function usePaginatedQuery<T>(
    entityName: string,
    options: UsePaginatedQueryOptions<T> = {}
) {
    const {
        page = 1,
        pageSize = 10,
        searchTerm = "",
        searchFields = [],
        orderBy = "created_at",
        orderDirection = "desc",
        additionalFilters = {},
        enabled = true,
        requireAuth = true,
        transformData,
        select = "*" // Default to select all
    } = options;

    return useQuery({
        queryKey: [
            entityName,
            "paginated",
            page,
            pageSize,
            searchTerm,
            searchFields,
            orderBy,
            orderDirection,
            additionalFilters,
            select
        ],
        queryFn: async (): Promise<PaginatedResponse<T>> => {
            const supabase = supabaseClient();

            // Check authentication if required
            if (requireAuth) {
                const { data } = await supabase.auth.getSession();
                if (!data.session) {
                    throw new Error("Authentication required");
                }
            }

            const offset = (page - 1) * pageSize;

            // Build the base query
            let query = supabase
                .from(entityName)
                .select(select, { count: "exact" });

            // Apply search filter if search term and search fields are provided
            // For custom selects, we need to handle search differently
            if (searchTerm.trim() && searchFields.length > 0) {
                // For simple selects, use the standard approach
                if (select === "*") {
                    const searchConditions = searchFields.map(field =>
                        `${field}.ilike.%${searchTerm}%`
                    ).join(",");
                    query = query.or(searchConditions);
                } else {
                    // For custom selects with joins, search on the main table fields
                    const mainTableSearchConditions = searchFields
                        .filter(field => !field.includes('.')) // Only search on main table fields
                        .map(field => `${field}.ilike.%${searchTerm}%`)
                        .join(",");
                    if (mainTableSearchConditions) {
                        query = query.or(mainTableSearchConditions);
                    }
                }
            }

            // Apply additional filters
            Object.entries(additionalFilters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        query = query.in(key, value);
                    } else {
                        query = query.eq(key, value);
                    }
                }
            });

            // Apply ordering and pagination
            query = query
                .order(orderBy, { ascending: orderDirection === "asc" })
                .range(offset, offset + pageSize - 1);

            const { data, error, count } = await query;

            if (error) {
                console.error(`Supabase error for ${entityName}:`, error);
                throw error;
            }

            const totalRecords = count || 0;
            const totalPages = Math.ceil(totalRecords / pageSize) || 1;
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            // Transform data if provided
            const transformedData = transformData ? transformData(data || []) : (data as T[] || []);

            return {
                data: transformedData,
                pagination: {
                    totalRecords,
                    totalPages,
                    currentPage: page,
                    pageSize,
                    hasNextPage,
                    hasPrevPage
                }

            };
        },
        enabled,
    });
}

// Helper function to create entity-specific paginated hooks
export function createPaginatedHook<T>(
    entityName: string,
    defaultOptions: Partial<UsePaginatedQueryOptions<T>> = {}
) {
    return (options: UsePaginatedQueryOptions<T> = {}) =>
        usePaginatedQuery<T>(entityName, { ...defaultOptions, ...options });
}

// Pre-configured hooks for common entities
export function usePaginatedUsers<T = any>(options: UsePaginatedQueryOptions<T> = {}) {
    return usePaginatedQuery<T>("users", {
        searchFields: ["name", "email", "full_name"],
        orderBy: "created_at",
        orderDirection: "desc",
        ...options
    });
}
