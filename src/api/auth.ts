import apiClient from './axiosInstance';
import endpoints from './endpoints';

export interface FirebaseLoginPayload {
  id_token: string;
}

export interface SignupPayload {
  full_name: string;
  email: string;
  password: string;
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
  } satisfies FirebaseLoginPayload);

  return response.data;
};

export const signup = async (payload: SignupPayload) => {
  const response = await apiClient.post(endpoints.account.signup, payload);
  return response.data;
};

export const authAPI = {
  register: signup,
};
