import { addToast } from "@heroui/react";
import { LOCALE_ID } from "@/app/config";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for conditionally joining class names together.
 * Combines clsx for conditional classes with tailwind-merge for proper Tailwind CSS class merging.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const tagBuilder = (tags: string, id?: string): string => {
  return id ? `${tags}#${id}` : tags;
};

/**
 * Validates file size
 * @param file File to validate
 * @param maxSizeMB Maximum size in MB
 * @returns boolean - true if valid, false if exceeds size
 */
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    displayToast({
      type: "danger",
      title: "File too large",
      description: `File size exceeds ${maxSizeMB}MB limit`,
    });
    return false;
  }
  return true;
};

/**
 * Validates file is an image
 * @param file File to validate
 * @returns boolean - true if valid image, false otherwise
 */
export const validateImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    displayToast({
      type: "danger",
      title: "Unsupported file type",
      description: `Only JPG, PNG and WEBP images are allowed`,
    });
    return false;
  }
  return true;
};

export function flattenIdProperties<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] && typeof result[key] === 'object' && 'id' in result[key]) {
      result[key] = result[key].id;
    }
  }
  delete result.xata;
  return result;
}

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = (error) => reject(error);
  });
};

export const formatPrice = (price: number) => {
  return `${Math.floor(price / 1000).toLocaleString(LOCALE_ID)}K`;
};

export const formatToLocale = (value: number): string => value.toLocaleString(LOCALE_ID);

/**
 * Calculates rental price using the best available package + extra days at per-day rate.
 *
 * Logic:
 * 1. Find the largest package whose `days` <= totalDays.
 * 2. Use that package's price as the base.
 * 3. Charge `price_per_day` for every remaining day beyond the package.
 *
 * Examples:
 *   packages=[{days:2,price:40000}], price_per_day=25000, days=3
 *   → 40000 + 1*25000 = 65000
 *
 *   packages=[{days:1,price:30000},{days:2,price:40000}], price_per_day=25000, days=3
 *   → best pkg = 2 days → 40000 + 1*25000 = 65000
 *
 *   packages=[], price_per_day=25000, days=3
 *   → 3*25000 = 75000
 */
export const calcRentalPrice = (
  pricePerDay: number,
  packages: Array<{ days: number; price: number }> | undefined | null,
  totalDays: number
): number => {
  if (!packages || packages.length === 0) {
    return pricePerDay * totalDays;
  }

  // Sort packages ascending by days
  const sorted = [...packages].sort((a, b) => a.days - b.days);

  // Find the best (largest) package that fits within totalDays
  let bestPkg: { days: number; price: number } | null = null;
  for (const pkg of sorted) {
    if (pkg.days <= totalDays) {
      bestPkg = pkg;
    }
  }

  if (!bestPkg) {
    // No package fits (e.g., smallest package is 3 days but user wants 1 day)
    // Fall back to per-day rate
    return pricePerDay * totalDays;
  }

  const extraDays = totalDays - bestPkg.days;
  return bestPkg.price + extraDays * pricePerDay;
};

export const getRecommendation = (
  list: any[],
  type?: "category" | "series",
  param?: string
) => {
  if (!type || !param) {
    const shuffled = [...list];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 5);
  }

  const filtered = list.filter((item) => {
    const characters = item.is_bundle && Array.isArray(item.bundle_catalog)
      ? item.bundle_catalog.map((i: any) => i?.character).filter(Boolean)
      : [item.character];

    return characters.some((char: any) => {
      if (!char?.series) return false;
      return type === "series"
        ? char.series.id === param
        : char.series.category === param;
    });
  });

  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered.slice(0, 5);
};

export const getHomeCatalog = (
  catalogItems: any[],
  type: "newest" | "soon",
) => {
  const now = new Date();
  return catalogItems.filter((item) => {
    if (type === "newest") {
      return item.status === "ready" && new Date(item.release_date) <= now;
    } else if (type === "soon") {
      return item.status === "soon";
    }
    return false;
  }).sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
}

export const filterCatalog = (
  catalogItems: any[],
  filters: {
    brand?: string;
    character?: string;
    series?: string;
    category?: string;
    status?: "ready" | "soon";
    minPrice?: number;
    maxPrice?: number;
    size?: "xs" | "s" | "m" | "l" | "xl" | "xxl";
    gender?: "male" | "female" | "unisex";
    name?: string;
  }
) => {
  return catalogItems.filter((item) => {
    // Filter by brand
    if (filters.brand && item.brand?.id !== filters.brand) {
      return false;
    }

    // Filter by character
    if (filters.character) {
      if (item.is_bundle) {
        const hasCharacter = item.bundle_catalog.some((bundleItem: any) => {
          if (bundleItem?.character?.id !== filters.character) return false;
          // If series filter is active, check series match
          if (filters.series && bundleItem?.character?.series?.id !== filters.series) {
            return false;
          }
          // If category filter is active, check category match
          if (filters.category && bundleItem?.character?.series?.category !== filters.category) {
            return false;
          }
          return true;
        });
        if (!hasCharacter) return false;
      } else {
        if (item.character?.id !== filters.character) return false;
        // If series filter is active, check series match
        if (filters.series && item.character?.series?.id !== filters.series) {
          return false;
        }
        // If category filter is active, check category match
        if (filters.category && item.character?.series?.category !== filters.category) {
          return false;
        }
      }
    }

    // Filter by series
    if (filters.series) {
      if (item.is_bundle) {
        const hasSeries = item.bundle_catalog.some(
          (bundleItem: any) => bundleItem?.character?.series?.id === filters.series
        );
        if (!hasSeries) return false;
      } else if (item.character?.series?.id !== filters.series) {
        return false;
      }
    }

    // Filter by category
    if (filters.category) {
      if (item.is_bundle) {
        const hasCategory = item.bundle_catalog.some(
          (bundleItem: any) => bundleItem?.character?.series?.category === filters.category
        );
        if (!hasCategory) return false;
      } else if (item.character?.series?.category !== filters.category) {
        return false;
      }
    }

    // Filter by status
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // Filter by price range
    if (filters.minPrice && item.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && item.price > filters.maxPrice) {
      return false;
    }

    // Filter by size
    if (filters.size && item.size !== filters.size) {
      return false;
    }

    // Filter by gender
    if (filters.gender && item.gender !== filters.gender) {
      return false;
    }

    // Filter by name
    if (filters.name && !item.name?.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    return true;
  });
};

/**
 * Generates a cached image URL based on the given parameters.
 *
 * @param {object} opts - An object containing the following properties:
 *   - url: The URL of the image.
 *   - w: The width of the image.
 *   - h: The height of the image.
 *   - q: The quality of the image.
 *   - maxage: The maximum age of the image : 1d, 1w, 1m, 1y.
 *
 * @returns {string} The cached image URL.
 */
export const cachedImage = ({ url, w, h, q, fit, cbg, flip, flop, maxage }: {
  url: string,
  w?: number,
  h?: number,
  q?: number,
  fit?: 'inside' | 'outside' | 'cover' | 'contain' | 'fill',
  cbg?: string,
  flip?: boolean,
  flop?: boolean,
  maxage?: string
}) => {
  const params = new URLSearchParams();
  params.set('url', url.split('//')[1]);
  if (w) params.set('w', w.toString());
  if (h) params.set('h', h.toString());
  if (q) params.set('q', q.toString());
  if (fit) params.set('fit', fit);
  if (cbg) params.set('cbg', cbg);
  if (flip) params.set('flip', '');
  if (flop) params.set('flop', '');
  if (maxage) params.set('maxage', maxage);

  return `https://wsrv.nl?${params.toString()}`;
}

export const displayToast = ({ type, title, description }: { type: "success" | "danger" | "warning" | "default", title: string, description: string }) => {
  addToast({
    title,
    description,
    color: type,
  })
};
