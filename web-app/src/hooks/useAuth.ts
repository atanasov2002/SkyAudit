import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";

type UserProfile = {
  id: string;
  name: string;
  userId: string;
  email: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: Date;
};

type UserProfileDataType = {
  message: string;
  user: UserProfile | null;
};

// --- Queries ---

export function useProfile(): UseQueryResult<UserProfileDataType, Error> {
  return useQuery<UserProfileDataType, Error>({
    queryKey: queryKeys.auth.profile,
    queryFn: () => apiClient.getProfile(),
    retry: false, // Don't retry 401s indefinitely
    staleTime: 1000 * 60 * 5, // Profile data is likely stable for 5 mins
  });
}

// --- Mutations ---

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
    onSuccess: () => {
      // Invalidate profile so the app knows we are logged in
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.profile, null); // clear cache instantly
      queryClient.clear(); // clear all data
    },
  });
}
