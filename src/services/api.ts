import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  paramsSerializer: {
    indexes: null,
  },
});

// Request Interceptor: Attach Auth Token, Timezone, and handle FormData Content-Type
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
    if (tz && config.headers) {
      config.headers['X-Timezone'] = tz;
    }
  } catch {
    if (config.headers) {
      config.headers['X-Timezone'] = 'Asia/Jakarta';
    }
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers) {
      if (typeof (config.headers as any).delete === 'function') {
        (config.headers as any).delete('Content-Type');
        (config.headers as any).delete('content-type');
      }
      delete (config.headers as any)['Content-Type'];
      delete (config.headers as any)['content-type'];
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Unwrap Response Envelope & Handle Errors
api.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res && typeof res.success === 'boolean' && !res.success) {
      const err = new Error(res.message || 'Operasi gagal');
      (err as any).response = response;
      return Promise.reject(err);
    }
    if (res && res.error && typeof res.error === 'object' && res.error.message) {
      const err = new Error(res.error.message);
      (err as any).response = response;
      return Promise.reject(err);
    }
    return res;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/sso/exchange');

      const authStore = useAuthStore();

      if (isAuthEndpoint || (originalRequest as any)._retry) {
        authStore.logout();
        return Promise.reject(error);
      }

      if (authStore.refreshToken) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        (originalRequest as any)._retry = true;
        isRefreshing = true;

        try {
          const baseURL = api.defaults.baseURL || '/api/v1';
          const refreshRes = await axios.post(`${baseURL}/auth/refresh`, {
            refresh_token: authStore.refreshToken,
            device_id: 'sarpras-kelapa-web',
          });

          const resData = refreshRes.data?.data || refreshRes.data;
          const newAccessToken = resData.access_token;
          const newRefreshToken = resData.refresh_token;
          const rawUser = resData.user;

          authStore.setAuth(newAccessToken, rawUser, newRefreshToken);
          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          authStore.logout();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        authStore.logout();
      }
    }

    let resData = error.response?.data;
    if (typeof resData === 'string') {
      try {
        resData = JSON.parse(resData);
      } catch {
        // ignore
      }
    }

    const message =
      (typeof resData?.error === 'string' ? resData.error : resData?.error?.message) ||
      resData?.message ||
      (typeof resData === 'string' ? resData : null) ||
      error.message ||
      'Terjadi kesalahan jaringan';

    const customError = new Error(message);
    (customError as any).response = error.response;
    return Promise.reject(customError);
  }
);

export default api;
