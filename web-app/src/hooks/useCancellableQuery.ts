import { useEffect } from "react";
import {
  useQuery,
  UseQueryOptions,
  QueryFunction,
} from "@tanstack/react-query";

// Helper: wraps a fetcher to provide an AbortSignal to the queryFn
export function useCancellableQuery<TData, TError = unknown>(
  key: readonly unknown[],
  queryFn: (signal: AbortSignal) => Promise<TData>,
  options?: UseQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>(key, ({ signal }) => queryFn(signal), {
    ...options,
  });
}
