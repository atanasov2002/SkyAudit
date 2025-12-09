import { queuedAxios } from "../lib/axiosClient";
import type { AxiosRequestConfig } from "axios";

export async function apiGet<T = any>(url: string, cfg?: AxiosRequestConfig) {
  const res = await queuedAxios.get<T>(url, cfg);
  return res.data as T;
}

export async function apiPost<T = any, B = any>(
  url: string,
  body?: B,
  cfg?: AxiosRequestConfig
) {
  const res = await queuedAxios.post<T>(url, body, cfg);
  return res.data as T;
}

export async function apiPut<T = any, B = any>(
  url: string,
  body?: B,
  cfg?: AxiosRequestConfig
) {
  const res = await queuedAxios.put<T>(url, body, cfg);
  return res.data as T;
}

export async function apiDelete<T = any>(
  url: string,
  cfg?: AxiosRequestConfig
) {
  const res = await queuedAxios.delete<T>(url, cfg);
  return res.data as T;
}
