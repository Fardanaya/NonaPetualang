import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';

interface UsePaginationOptions {
    initialPage?: number;
    initialPageSize?: number;
    debounceDelay?: number;
}

interface UsePaginationReturn<T> {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    page: number;
    setPage: (page: number) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
    debouncedSearch: string;
    offset: number;
    filteredData: T[];
    paginatedData: T[];
    totalPages: number;
    totalItems: number;
}

interface SearchConfig<T> {
    searchFields: (keyof T)[];
    customFilter?: (item: T, searchTerm: string) => boolean;
}

export const usePagination = <T>(
    data: T[] = [],
    searchConfig?: SearchConfig<T>,
    options: UsePaginationOptions = {}
): UsePaginationReturn<T> => {
    const {
        initialPage = 1,
        initialPageSize = 10,
        debounceDelay = 500
    } = options;

    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [debouncedSearch] = useDebounce(searchTerm, debounceDelay);

    const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!debouncedSearch.trim() || !searchConfig) {
            return data;
        }

        const searchTermLower = debouncedSearch.toLowerCase();

        return data.filter(item => {
            // Use custom filter if provided
            if (searchConfig.customFilter) {
                return searchConfig.customFilter(item, debouncedSearch);
            }

            // Default search through specified fields
            return searchConfig.searchFields.some(field => {
                const value = item[field];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchTermLower);
                }
                if (typeof value === 'number') {
                    return value.toString().includes(searchTermLower);
                }
                return false;
            });
        });
    }, [data, debouncedSearch, searchConfig]);

    // Paginate the filtered data
    const paginatedData = useMemo(() => {
        return filteredData.slice(offset, offset + pageSize);
    }, [filteredData, offset, pageSize]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredData.length / pageSize);
    }, [filteredData.length, pageSize]);

    const totalItems = filteredData.length;

    return {
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        pageSize,
        setPageSize,
        debouncedSearch,
        offset,
        filteredData,
        paginatedData,
        totalPages,
        totalItems
    };
};

// Simple pagination hook without search functionality
export const useSimplePagination = (options: UsePaginationOptions = {}) => {
    const {
        initialPage = 1,
        initialPageSize = 10,
        debounceDelay = 500
    } = options;

    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [debouncedSearch] = useDebounce(searchTerm, debounceDelay);

    const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

    return {
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        pageSize,
        setPageSize,
        debouncedSearch,
        offset
    };
};
