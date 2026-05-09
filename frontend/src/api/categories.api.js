import api from './axiosInstance';

/**
 * Fetch all categories.
 * Maps to: GET /categories
 */
export async function getCategories() {
  const { data } = await api.get('/categories');
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch a single category by ID.
 * Maps to: GET /categories/:id
 */
export async function getCategoryById(id) {
  const { data } = await api.get(`/categories/${id}`);
  return data;
}
