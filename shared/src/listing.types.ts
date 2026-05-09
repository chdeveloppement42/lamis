/**
 * Listing shared types
 * Mirrors the Prisma Listing model shape as returned by the API.
 */

export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
export type ListingType = 'VENTE' | 'LOCATION';

export type ListingCategory =
  | 'APARTMENT'
  | 'VILLA'
  | 'OFFICE'
  | 'LAND'
  | 'COMMERCIAL'
  | 'OTHER';

/** API response shape for a single listing */
export interface ListingResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  type: ListingType;
  wilaya: string;
  commune: string;
  quartier?: string;
  surface?: number;
  rooms?: number;
  floor?: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
  status: ListingStatus;
  /** Array of relative image URLs served from /uploads */
  images: string[] | any[];
  providerId: number;
  createdAt: string;
  updatedAt: string;
}

/** Paginated listing list response */
export interface PaginatedListings {
  data: ListingResponse[];
  total: number;
  page: number;
  limit: number;
}

/** Query params for GET /listings */
export interface ListingFilterParams {
  wilaya?: string;
  commune?: string;
  category?: ListingCategory;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
