import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getOrders = async () => {
  const response = await apiClient.get(endpoints.order.list());
  return response.data;
};

export const getOrderDetail = async (orderId: string | number) => {
  const response = await apiClient.get(endpoints.order.detail(orderId));
  return response.data;
};
