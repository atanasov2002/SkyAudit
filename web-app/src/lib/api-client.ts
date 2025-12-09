import { API_URL } from "@/app/config";

class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  constructor(private baseUrl: string) {}

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    const controller = new AbortController();

    const config: RequestInit = {
      ...options,
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!res.ok) {
        if (res.status === 401) {
          // Try session refresh if backend supports it
          const refreshed = await this.refreshSession();
          if (refreshed) {
            return this.request(endpoint, options, false); // single retry
          }
          //window.location.replace("/login");
          throw new ApiError("Session expired", 401);
        }

        const data = await res.json().catch(() => undefined);
        throw new ApiError(
          (data as any)?.message || "Request failed",
          res.status,
          data
        );
      }

      return res.json() as Promise<T>;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if ((err as any).name === "AbortError")
        throw new Error("Request cancelled");

      throw new ApiError("Network error", 0, err);
    }
  }

  private async refreshSession(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string) {
    return this.request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout() {
    await this.request(
      "/auth/logout",
      {
        method: "POST",
      },
      false
    );
  }

  async getProfile() {
    return this.request<any>(`/auth/profile`, {
      credentials: "include",
    });
  }

  // AWS Accounts
  async getAwsAccounts() {
    return this.request<any>("/aws/accounts");
  }

  async getAwsAccount(accountId: string) {
    return this.request<any>(`/aws/accounts/${accountId}`);
  }

  async connectAwsAccount(data: {
    accountName: string;
    roleArn?: string;
    externalId?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    regions?: string[];
  }) {
    return this.request<any>("/aws/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAwsAccount(accountId: string, data: any) {
    return this.request<any>(`/aws/accounts/${accountId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async disconnectAwsAccount(accountId: string) {
    return this.request<any>(`/aws/accounts/${accountId}`, {
      method: "DELETE",
    });
  }

  async syncAwsAccount(accountId: string) {
    return this.request<any>(`/aws/accounts/${accountId}/sync`, {
      method: "POST",
    });
  }

  // Services
  async getServices(accountId: string, params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(
      `/aws/accounts/${accountId}/services${query ? `?${query}` : ""}`
    );
  }

  async getService(accountId: string, serviceId: string) {
    return this.request<any>(
      `/aws/accounts/${accountId}/services/${serviceId}`
    );
  }

  // Cost & Analytics
  async getCostSummary(accountId: string) {
    return this.request<any>(`/aws/accounts/${accountId}/cost-summary`);
  }

  async getRecommendations(accountId: string) {
    return this.request<any>(`/aws/accounts/${accountId}/recommendations`);
  }

  // Alerts
  async getAlerts(status?: string) {
    const query = status ? `?status=${status}` : "";
    return this.request<any>(`/aws/alerts${query}`);
  }

  async acknowledgeAlert(alertId: string) {
    return this.request<any>(`/aws/alerts/${alertId}/acknowledge`, {
      method: "POST",
    });
  }

  async resolveAlert(alertId: string, note?: string) {
    return this.request<any>(`/aws/alerts/${alertId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolutionNote: note }),
    });
  }

  async dismissAlert(alertId: string) {
    return this.request<any>(`/aws/alerts/${alertId}/dismiss`, {
      method: "POST",
    });
  }

  // Dashboard
  async getDashboard() {
    return this.request<any>(`/aws/dashboard`, {
      credentials: "include",
    });
  }
}

export const apiClient = new ApiClient(API_URL);
export { ApiError };
