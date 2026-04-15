export const API_BASE_URL = "http://localhost:5000";

export const FALLBACK_SALON_IMAGE =
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80";

export function getImageUrl(imageUrl) {
  if (!imageUrl) return FALLBACK_SALON_IMAGE;

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}