import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getBrands = async (params?: {
  search?: string;
  page_size?: number;
  page?: number;
}) => {
  const response = await apiClient.get(endpoints.brand.list(params));
  return response.data;
};

export const getMostSearchedBrands = async () => {
  const response = await apiClient.get(endpoints.brand.mostSearched());
  return response.data;
};
