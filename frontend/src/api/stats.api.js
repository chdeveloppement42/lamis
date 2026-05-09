import axiosInstance from './axiosInstance';

/**
 * Fetch platform statistics for the dashboard and landing page.
 * Example expected response from backend:
 * {
 *   activeListings: 124,
 *   totalProviders: 45,
 *   citiesCovered: 12
 * }
 */
export const getPlatformStats = async () => {
  try {
    const response = await axiosInstance.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch platform stats, using mock data fallback:', error);
    // TODO: Remove mock fallback once backend GET /api/stats is implemented
    return {
      activeListings: 500,
      totalProviders: 120,
      citiesCovered: 10
    };
  }
};
