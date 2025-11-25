import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getVendors = async (params?: {
  search?: string;
  page_size?: number;
}) => {
  const response = await apiClient.get(endpoints.vendor.list(params));
  return response.data;
};

export const getVendorDetail = async (id: string | number) => {
  const response = await apiClient.get(endpoints.vendor.detail(id));
  return response.data;
};

export const getVendorBanners = async () => {
  const response = await apiClient.get(endpoints.vendor.banners());
  return response.data;
};
