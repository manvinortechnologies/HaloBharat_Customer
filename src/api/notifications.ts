import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getNotifications = async () => {
  const response = await apiClient.get(endpoints.notification.list());
  return response.data;
};

