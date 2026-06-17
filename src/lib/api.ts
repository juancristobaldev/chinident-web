import { useAuthStore } from "@/stores/auth-store";

const API_URL = " https://chinident-api.argoz.cl/api";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      },
    });
    clearTimeout(timeout);

    if (response.status === 401 && !endpoint.startsWith("/auth/login")) {
      const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshResponse.ok) {
        const retryResponse = await fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...((options.headers as Record<string, string>) || {}),
          },
        });
        return this.handleResponse<T>(retryResponse);
      }

      if (typeof window !== "undefined") {
        try { localStorage.removeItem("user"); } catch {}

        fetch(`${this.baseUrl}/auth/logout`, {
          method: "POST",
          credentials: "include",
        }).catch(() => {});

        useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });

        if (!window.location.pathname.startsWith("/auth/")) {
          window.location.href = "/auth/login";
        }
      }
      throw new ApiError("Sesión expirada", 401);
    }

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    let data: any;
    try {
      data = await response.json();
    } catch {
      const text = await response.text().catch(() => "");
      throw new ApiError(text || "Error en la solicitud", response.status);
    }
    if (!response.ok) {
      throw new ApiError(
        data.message || "Error en la solicitud",
        response.status,
        data.errors
      );
    }
    return data.data ?? data;
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = new ApiClient(API_URL);
