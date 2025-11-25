import axios, {
  AxiosHeaders,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../config/api';
import { AUTH_DATA_KEY } from '../storage/authStorage';
import { refreshAccessToken, isTokenExpired } from '../utils/tokenUtils';

const AUTH_FALLBACK_KEY = 'authData';

let globalLogoutFunction: (() => void | Promise<void>) | null = null;
export const setGlobalLogoutFunction = (
  logoutFn: () => void | Promise<void>,
) => {
  globalLogoutFunction = logoutFn;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, ''),
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const getStoredAuthData = async () => {
  const raw =
    (await AsyncStorage.getItem(AUTH_DATA_KEY)) ??
    (await AsyncStorage.getItem(AUTH_FALLBACK_KEY));
  return raw ? JSON.parse(raw) : null;
};

const setAuthHeader = (
  config: InternalAxiosRequestConfig,
  token: string,
): void => {
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    const headerRecord =
      (config.headers as Record<string, string | undefined>) ?? {};
    config.headers = AxiosHeaders.from({
      ...headerRecord,
      Authorization: `Bearer ${token}`,
    });
  }
};

let isLoggingOut = false;

const handleSessionExpired = async () => {
  if (isLoggingOut) {
    return;
  }
  isLoggingOut = true;

  await AsyncStorage.removeItem(AUTH_DATA_KEY);
  await AsyncStorage.removeItem(AUTH_FALLBACK_KEY);

  const completeLogout = () => {
    if (globalLogoutFunction) {
      Promise.resolve(globalLogoutFunction()).finally(() => {
        isLoggingOut = false;
      });
    } else {
      isLoggingOut = false;
    }
  };

  Alert.alert('Session Expired', 'Please login again.', [
    {
      text: 'OK',
      onPress: completeLogout,
    },
  ]);
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const storedData = await getStoredAuthData();
      let accessToken =
        storedData?.access_token ?? storedData?.access ?? undefined;

      if (accessToken && (await isTokenExpired(accessToken))) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          accessToken = refreshed;
        }
      }

      if (accessToken) {
        setAuthHeader(config, accessToken);
      }
    } catch (error) {
      console.warn('Request Interceptor Error:', error);
    }

    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await handleSessionExpired();
      return Promise.reject(error);
    }

    if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
    } else {
      const responseData = error.response?.data as
        | { message?: string; detail?: string }
        | undefined;
      error.message =
        responseData?.message ||
        responseData?.detail ||
        error.message ||
        'Something went wrong';
    }

    return Promise.reject(error);
  },
);

export default apiClient;
