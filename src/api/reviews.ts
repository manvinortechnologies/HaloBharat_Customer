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

export const createReview = async (
  productId: string | number,
  reviewData: {
    product: string;
    rating: number;
    review_text: string;
  },
) => {
  const response = await apiClient.post(
    endpoints.review.create(productId),
    reviewData,
  );
  return response.data;
};
