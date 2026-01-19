import apiClient from './axiosInstance';
import endpoints from './endpoints';

export interface FirebaseLoginPayload {
  id_token: string;
  role: string;
}

export interface SignupPayload {
  full_name: string;
  email: string;
  // password: string;
  contact_phone: string;
  gender: string;
  address: string;
  role: string;
  status: string;
  pincode: string;
  state: string;
  city: string;
  locality?: string;
}

export const firebaseLogin = async (idToken: string) => {
  const response = await apiClient.post(endpoints.account.firebaseLogin, {
    id_token: idToken,
    role: 'Customer',
  } satisfies FirebaseLoginPayload);

  return response.data;
};

export const signup = async (payload: SignupPayload) => {
  const response = await apiClient.post(endpoints.account.signup, payload);
  return response.data;
};

export const deleteAccount = async (mobileNumber: string) => {
  const response = await apiClient.post(endpoints.account.delete, {
    mobile_number: mobileNumber,
  });
  return response.data;
};

export const authAPI = {
  register: signup,
  deleteAccount: deleteAccount,
};
