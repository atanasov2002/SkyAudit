import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import { ConnectAwsAccountType, FetchAccountType } from "@/types/app";

// --- Queries ---

export function useAwsAccounts(): UseQueryResult<
  ConnectAwsAccountType[],
  Error
> {
  return useQuery<ConnectAwsAccountType[], Error>({
    queryKey: queryKeys.aws.accounts,
    queryFn: () => apiClient.getAwsAccounts(),
  });
}

export function useAwsAccount(
  accountId: string
): UseQueryResult<FetchAccountType, Error> {
  return useQuery<FetchAccountType, Error>({
    queryKey: queryKeys.aws.account(accountId),
    queryFn: () => apiClient.getAwsAccount(accountId),
    enabled: !!accountId,
  });
}

// --- Mutations ---

export function useConnectAwsAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof apiClient.connectAwsAccount>[0]) =>
      apiClient.connectAwsAccount(data),
    onSuccess: () => {
      // Vital: Refetch the list automatically after adding a new account
      queryClient.invalidateQueries({ queryKey: queryKeys.aws.accounts });
    },
  });
}

export function useDisconnectAwsAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      apiClient.disconnectAwsAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aws.accounts });
    },
  });
}

export function useCostSummary(accountId: string) {
  return useQuery({
    queryKey: ["aws", "cost", accountId], // Or queryKeys.aws.cost(accountId)
    queryFn: () => apiClient.getCostSummary(accountId),
    enabled: !!accountId,
  });
}

// 2. Hook for Syncing Account
export function useSyncAwsAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => apiClient.syncAwsAccount(accountId),
    onSuccess: (data, accountId) => {
      // Invalidate all data related to this account so it refreshes automatically
      queryClient.invalidateQueries({
        queryKey: ["aws", "account", accountId],
      });
      queryClient.invalidateQueries({
        queryKey: ["aws", "services", accountId],
      });
      queryClient.invalidateQueries({ queryKey: ["aws", "cost", accountId] });
    },
  });
}
