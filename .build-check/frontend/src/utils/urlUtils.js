const API_URL = import.meta.env.VITE_API_URL;

/**
 * Generates a full URL for an image/asset from the backend.
 * Normalizes slashes to prevent double-slash (//) errors.
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // If it's already a full URL (e.g. external asset), return it as is
  if (path.startsWith('http')) return path;

  const baseUrl = API_URL.replace(/\/+$/, '');
  const relativePath = path.replace(/^\/+/, '');
  
  return `${baseUrl}/${relativePath}`;
};
