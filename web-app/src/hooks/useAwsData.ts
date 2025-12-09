import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import {
  CollectionServicesDataType,
  DashboardData,
  ServiceDataType,
} from "@/types/app";

export function useDashboard(): UseQueryResult<DashboardData, Error> {
  return useQuery<DashboardData, Error>({
    queryKey: queryKeys.aws.dashboard,
    queryFn: () => apiClient.getDashboard(),
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

export function useService(
  accountId: string,
  serviceId: string
): UseQueryResult<any, Error> {
  return useQuery({
    // We create a unique key for this specific service
    // If you have queryKeys defined, use: queryKeys.aws.service(accountId, serviceId)
    queryKey: ["aws", "services", accountId, serviceId],
    queryFn: () => apiClient.getService(accountId, serviceId),
    enabled: !!accountId && !!serviceId, // Only fetch when IDs are present
  });
}

export function useServices(
  accountId: string,
  params?: any
): UseQueryResult<CollectionServicesDataType, Error> {
  return useQuery<CollectionServicesDataType, Error>({
    // Include params in the key so changing filters triggers a refetch
    queryKey: queryKeys.aws.services(accountId, params),
    queryFn: () => apiClient.getServices(accountId, params),
    enabled: !!accountId,
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      apiClient.resolveAlert(id, note),
    onSuccess: () => {
      // Invalidate all alert lists regardless of status filter
      queryClient.invalidateQueries({ queryKey: ["aws", "alerts"] });
    },
  });
}
