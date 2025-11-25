import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { API_BASE_URL } from '../config/api';
import { AUTH_DATA_KEY, AuthData, storeAuthData } from '../storage/authStorage';

const AUTH_FALLBACK_KEY = 'authData';
const REFRESH_ENDPOINT = '/account/token/refresh/';

const getStoredAuthData = async () => {
  const raw =
    (await AsyncStorage.getItem(AUTH_DATA_KEY)) ??
    (await AsyncStorage.getItem(AUTH_FALLBACK_KEY));
  return raw
    ? (JSON.parse(raw) as AuthData & { access?: string; refresh?: string })
    : null;
};

const decodeJwt = (token: string) => {
  const [, payload] = token.split('.');
  if (!payload) {
    return null;
  }
  try {
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = async (token?: string) => {
  if (!token) {
    return true;
  }

  const payload = decodeJwt(token);
  if (!payload?.exp) {
    return false;
  }

  const expiry = payload.exp * 1000;
  const now = Date.now();
  return expiry - now <= 5000; // consider token expired within 5s window
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const stored = await getStoredAuthData();
  if (!stored) {
    return null;
  }

  const refreshToken = stored.refresh_token ?? stored.refresh;
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  const newAccess = data?.access ?? data?.access_token;
  const newRefresh = data?.refresh ?? data?.refresh_token ?? refreshToken;

  if (!newAccess) {
    return null;
  }

  await storeAuthData({
    ...stored,
    access_token: newAccess,
    refresh_token: newRefresh,
  });

  return newAccess;
};
