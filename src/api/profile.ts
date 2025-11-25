import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getProfile = async () => {
  const response = await apiClient.get(endpoints.profile.me());
  return response.data;
};
