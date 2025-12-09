import { QueryClient } from "@tanstack/react-query";
import { showToastError } from "../components/ui/toast";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      cacheTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (err: unknown) => {
        const message = (err as any)?.message || "Request failed";
        showToastError(message);
      },
    },
    mutations: {
      retry: 1,
      onError: (err: unknown) => {
        const message = (err as any)?.message || "Request failed";
        showToastError(message);
      },
    },
  },
});
