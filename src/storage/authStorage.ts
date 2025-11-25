import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_DATA_KEY = '@HaloBharat:authData';
const AUTH_FALLBACK_KEY = 'authData';

export interface AuthData {
  access_token: string;
  refresh_token: string;
  [key: string]: any;
}

let cachedAuthData: AuthData | null = null;

export const setCachedAuthData = (data: AuthData | null) => {
  cachedAuthData = data;
};

export const getCachedAuthData = () => cachedAuthData;

export const getAuthToken = async () => {
  const raw =
    (await AsyncStorage.getItem(AUTH_DATA_KEY)) ??
    (await AsyncStorage.getItem(AUTH_FALLBACK_KEY));
  if (!raw) {
    return '';
  }
  const parsed = JSON.parse(raw) as AuthData & { access?: string };
  return parsed.access_token ?? parsed.access ?? '';
};

export const storeAuthData = async (data: AuthData) => {
  cachedAuthData = data;
  await AsyncStorage.setItem(AUTH_DATA_KEY, JSON.stringify(data));
  await AsyncStorage.setItem(
    AUTH_FALLBACK_KEY,
    JSON.stringify({
      ...data,
      access: data.access_token,
      refresh: data.refresh_token,
    }),
  );
  return data;
};

export const loadAuthData = async () => {
  try {
    const raw =
      (await AsyncStorage.getItem(AUTH_DATA_KEY)) ??
      (await AsyncStorage.getItem(AUTH_FALLBACK_KEY));
    if (!raw) {
      cachedAuthData = null;
      return null;
    }
    const parsed = JSON.parse(raw) as AuthData & {
      access?: string;
      refresh?: string;
    };
    const normalized: AuthData = {
      ...parsed,
      access_token: parsed.access_token ?? parsed.access ?? '',
      refresh_token: parsed.refresh_token ?? parsed.refresh ?? '',
    };
    cachedAuthData = normalized;
    return normalized;
  } catch (error) {
    cachedAuthData = null;
    return null;
  }
};

export const clearAuthData = async () => {
  cachedAuthData = null;
  await AsyncStorage.removeItem(AUTH_DATA_KEY);
  await AsyncStorage.removeItem(AUTH_FALLBACK_KEY);
};
