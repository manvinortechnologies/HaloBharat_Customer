import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getBestsellers = async (params?: {
  search?: string;
  page_size?: number;
  page?: number;
}) => {
  const response = await apiClient.get(endpoints.product.bestsellers(params));
  return response.data;
};

export const getProductDetail = async (id: string | number) => {
  const response = await apiClient.get(endpoints.product.details(id));
  return response.data;
};

export const getProducts = async (params?: {
  category?: string;
  search?: string;
  brand?: string;
  business?: string;
}) => {
  const response = await apiClient.get(endpoints.product.list(params));
  return response.data;
};
