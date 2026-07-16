export interface PaginatedResponse {
    status: number;
    message: string;
    data: any[];
    pagination?: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface SWRReturn {
    data: any | any[] | null;
    error: Error | null;
    isLoading: boolean;
    isValidating: boolean;
    mutate: () => void;
    pagination?: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export const presetPagination = [
    { key: "5", label: "5" },
    { key: "10", label: "10" },
    { key: "25", label: "25" },
    { key: "50", label: "50" },
    { key: "100", label: "100" },
];