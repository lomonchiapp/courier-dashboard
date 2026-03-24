interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

class ApiClientClass {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    const token = localStorage.getItem("auth-token");
    const tenantId = localStorage.getItem("auth-tenant-id");

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (tenantId) {
      headers["X-Tenant-Id"] = tenantId;
    }

    return headers;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error: ApiError = await res.json().catch(() => ({
        type: "unknown",
        title: "Error",
        status: res.status,
        detail: res.statusText,
        instance: path,
      }));

      if (res.status === 401) {
        localStorage.removeItem("auth-token");
        window.location.href = "/login";
      }

      throw error;
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  get<T>(path: string) { return this.request<T>("GET", path); }
  post<T>(path: string, body?: unknown) { return this.request<T>("POST", path, body); }
  patch<T>(path: string, body?: unknown) { return this.request<T>("PATCH", path, body); }
  delete<T>(path: string) { return this.request<T>("DELETE", path); }
}

export const api = new ApiClientClass();
