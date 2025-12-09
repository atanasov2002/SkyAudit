import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { showToastError } from "../components/ui/toast";
import { setupQueue } from "./axiosQueue";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4001";

export class ApiError extends Error {
  status: number;
  data?: any;
  constructor(message: string, status = 0, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function createAxios(): AxiosInstance {
  const ax = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // important for HttpOnly cookies
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30_000,
  });

  // Request interceptor: attach any headers you need (CSRF token retrieval if you use double-submit)
  ax.interceptors.request.use((cfg) => {
    // Example: if you store csrf token in a cookie (non-HttpOnly) or meta tag, attach here
    // const csrf = getCsrf();
    // if (csrf) cfg.headers!['X-CSRF-Token'] = csrf;
    return cfg;
  });

  // Response interceptor: central error handling
  ax.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      // If server returns JSON error, try to surface it
      const status = err.response?.status ?? 0;
      const data = err.response?.data;

      // Show toast for server error (400+)
      if (status >= 400) {
        const msg = data?.message || err.message || "Unknown error";
        try {
          showToastError(msg);
        } catch (_) {}
      }

      throw new ApiError(
        data?.message || err.message || "Network error",
        status,
        data
      );
    }
  );

  return ax;
}

export const axiosClient = createAxios();

// Wrap the axios instance with a queue controller (configurable concurrency)
export const queuedAxios = setupQueue(axiosClient, {
  concurrency: 6,
  retry: 2,
});

export type { AxiosRequestConfig };
