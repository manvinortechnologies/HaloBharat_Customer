import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getProjects = async (params?: { page?: number }) => {
  const response = await apiClient.get(endpoints.project.list(), { params });
  return response.data;
};

export const getProjectDetail = async (projectId: string | number) => {
  const response = await apiClient.get(endpoints.project.detail(projectId));
  return response.data;
};

export const createProject = async (payload: {
  title: string;
  is_active?: boolean;
}) => {
  const response = await apiClient.post(endpoints.project.list(), {
    is_active: true,
    ...payload,
  });
  return response.data;
};

export const assignProjectItems = async (
  projectId: string | number,
  orderItemIds: string[],
) => {
  const response = await apiClient.post(endpoints.project.assign(projectId), {
    order_item_ids: orderItemIds,
  });
  return response.data;
};

export const getProjectProducts = async (projectId: string | number) => {
  const response = await apiClient.get(endpoints.project.products(projectId));
  return response.data;
};
