import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getProductReviews = async (
  productId: string | number,
  params?: { search?: string },
) => {
  const response = await apiClient.get(
    endpoints.review.product(productId, params),
  );
  return response.data;
};

