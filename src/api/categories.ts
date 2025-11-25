import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getCategories = async (params?: Record<string, unknown>) => {
  const response = await apiClient.get(endpoints.category.list(), { params });
  return response.data;
};
