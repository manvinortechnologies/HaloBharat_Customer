import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getWishlist = async () => {
  const response = await apiClient.get(endpoints.wishlist.list());
  return response.data;
};

export const toggleWishlistItem = async (productId: string | number) => {
  const response = await apiClient.post(endpoints.wishlist.list(), {
    product: productId,
  });
  return response.data;
};

export const removeWishlistItem = async (wishlistItemId: string | number) => {
  const response = await apiClient.delete(
    endpoints.wishlist.remove(wishlistItemId),
  );
  return response.data;
};
