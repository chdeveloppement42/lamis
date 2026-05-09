import api from './axiosInstance';

/**
 * Fetch published listings with optional filters + pagination.
 * Maps to: GET /listings
 */
export async function getPublishedListings({ categoryId, wilaya, type, minPrice, maxPrice, page = 1, limit = 12 } = {}) {
  const params = {};
  if (categoryId) params.categoryId = categoryId;
  if (wilaya) params.wilaya = wilaya;
  if (type) params.type = type;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  params.page = page;
  params.limit = limit;

  const { data } = await api.get('/listings', { params });
  return data;
}

/**
 * Fetch the latest 6 published listings.
 * Maps to: GET /listings/latest
 */
export async function getLatestListings() {
  const { data } = await api.get('/listings/latest');
  return data;
}

/**
 * Fetch a single listing by ID (public detail view).
 * Maps to: GET /listings/:id
 */
export async function getListingById(id) {
  const { data } = await api.get(`/listings/${id}`);
  return data;
}
