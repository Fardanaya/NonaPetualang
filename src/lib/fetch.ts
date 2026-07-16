interface RequestConfig {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    cache?: "force-cache" | "no-store";
    revalidate?: false | 0 | number;
    tags?: string[];
}

export const fetchServer = async (
    url: string,
    options: RequestConfig = {},
) => {
    try {
        const fetchOptions: RequestInit = {
            method: options.method || "GET",
            body: options.body ? JSON.stringify(options.body) : null,
        };

        if (fetchOptions.method === "GET") {
            fetchOptions.next = {
                revalidate: 3600,
                tags: options.tags
            };
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            const errorData = await response.json();
            return errorData;
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

// Fetcher function for SWR
export const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        const error = new Error('An error occurred while fetching the data.');
        throw error;
    }
    return response.json();
};

export const fetchInstagram = async (username: string, forceRefresh?: boolean) => {
    if (!username) return;

    try {
        const response = await fetch(
            `https://api.weebdev.my.id/social/instagram/user?username_or_id=${username}&refresh=${forceRefresh || true}`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Instagram data');
        }

        const res = await response.json();

        if (res.data) {
            delete res.data.chaining_results;
            delete res.data.chaining_suggestions;
        }
        console.log("weeee", res)

        return res.data;

    } catch (error) {
        console.error("Failed to fetch Instagram data:", error);
        throw error;
    }
};

export const fetchAddressSuggestions = async (query: string, limit: number = 15) => {
    if (!query || query.length < 3) return { data: { locations: [] } };

    try {
        const response = await fetch(
            `https://api.weebdev.my.id/expedition/location?search=${encodeURIComponent(query)}&limit=${limit}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch address suggestions:", error);
        throw error;
    }
};

// Cache key and duration for expedition list
const EXPEDITION_CACHE_KEY = 'expedition_list_cache';
const EXPEDITION_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface ExpeditionCache {
    data: any[];
    timestamp: number;
}

export const fetchExpedition = async (search: string = "") => {
    try {
        // Check if we're in browser environment
        if (typeof window !== 'undefined') {
            // Try to get cached data
            const cachedData = localStorage.getItem(EXPEDITION_CACHE_KEY);

            if (cachedData) {
                const cache: ExpeditionCache = JSON.parse(cachedData);
                const now = Date.now();

                // Check if cache is still valid (within 7 days)
                if (now - cache.timestamp < EXPEDITION_CACHE_DURATION) {
                    const expeditions = cache.data;

                    // Filter by search if provided
                    if (search) {
                        return expeditions.filter((exp: any) =>
                            exp.name.toLowerCase().includes(search.toLowerCase()) ||
                            exp.code.toLowerCase().includes(search.toLowerCase())
                        );
                    }
                    return expeditions;
                }
            }
        }

        // Fetch fresh data from API
        const response = await fetch(`https://api.weebdev.my.id/expedition/list`);
        const data = await response.json();
        const expeditions = data.data?.expeditions || [];

        // Store in cache if in browser environment
        if (typeof window !== 'undefined' && expeditions.length > 0) {
            const cache: ExpeditionCache = {
                data: expeditions,
                timestamp: Date.now(),
            };
            localStorage.setItem(EXPEDITION_CACHE_KEY, JSON.stringify(cache));
        }

        // Filter by search if provided
        if (search) {
            return expeditions.filter((exp: any) =>
                exp.name.toLowerCase().includes(search.toLowerCase()) ||
                exp.code.toLowerCase().includes(search.toLowerCase())
            );
        }
        return expeditions;
    } catch (error) {
        console.error("Failed to fetch expedition data:", error);

        // If fetch fails, try to return cached data even if expired
        if (typeof window !== 'undefined') {
            const cachedData = localStorage.getItem(EXPEDITION_CACHE_KEY);
            if (cachedData) {
                const cache: ExpeditionCache = JSON.parse(cachedData);
                if (search) {
                    return cache.data.filter((exp: any) =>
                        exp.name.toLowerCase().includes(search.toLowerCase()) ||
                        exp.code.toLowerCase().includes(search.toLowerCase())
                    );
                }
                return cache.data;
            }
        }

        return [];
    }
};
