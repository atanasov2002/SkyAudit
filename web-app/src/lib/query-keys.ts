export const queryKeys = {
  auth: {
    profile: ["auth", "profile"] as const,
  },
  aws: {
    accounts: ["aws", "accounts"] as const,
    account: (id: string) => ["aws", "accounts", id] as const,
    services: (accountId: string, params?: any) =>
      ["aws", "services", accountId, params] as const,
    service: (accountId: string, serviceId: string) =>
      ["aws", "services", accountId, serviceId] as const,
    cost: (accountId: string) => ["aws", "cost", accountId] as const,
    dashboard: ["aws", "dashboard"] as const,
    alerts: (status?: string) => ["aws", "alerts", status] as const,
  },
};
