import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getAddresses = async () => {
  const response = await apiClient.get(endpoints.address.list());
  return response.data;
};

export interface CreateAddressPayload {
  title: string;
  full_name: string;
  phone: string;
  building: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string;
  latitude?: string | null;
  longitude?: string | null;
  is_default?: boolean;
}

export const createAddress = async (payload: CreateAddressPayload) => {
  const response = await apiClient.post(endpoints.address.list(), payload);
  return response.data;
};

export const updateAddress = async (
  id: string | number,
  payload: CreateAddressPayload,
) => {
  const response = await apiClient.patch(endpoints.address.update(id), payload);
  return response.data;
};

export const deleteAddress = async (id: string | number) => {
  const response = await apiClient.delete(endpoints.address.update(id));
  return response.data;
};
