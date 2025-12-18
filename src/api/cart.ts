import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getCartItems = async () => {
  const response = await apiClient.get(endpoints.cart.list());
  return response.data;
};

export const addCartItem = async (
  productId: string | number,
  quantity: number = 1,
) => {
  const response = await apiClient.post(endpoints.cart.add(), {
    product: productId,
    quantity: quantity,
  });
  return response.data;
};

export const checkoutCart = async (payload: Record<string, any>) => {
  const response = await apiClient.post(endpoints.cart.checkout(), payload);
  return response.data;
};

export const removeCartItem = async (cartItemId: string | number) => {
  const response = await apiClient.delete(
    endpoints.cart.remove(cartItemId),
    {},
  );
  return response.data;
};

export const updateCartItem = async (
  cartItemId: string | number,
  payload: {
    product: string;
    quantity: number;
  },
) => {
  const response = await apiClient.patch(
    endpoints.cart.update(cartItemId),
    payload,
  );
  return response.data;
};
