import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  tenantId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (apiKey: string, tenantId: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tenantId: null,
      role: null,
      isAuthenticated: false,

      login: async (apiKey: string, tenantId: string) => {
        // First set tenant for the API call
        localStorage.setItem("auth-tenant-id", tenantId);

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"}/v1/auth/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Tenant-Id": tenantId,
            },
            body: JSON.stringify({ apiKey }),
          }
        );

        if (!res.ok) {
          const error = await res.json().catch(() => ({ detail: "Error de autenticación" }));
          throw new Error(error.detail || "Credenciales inválidas");
        }

        const data = await res.json();

        // Decode JWT to get role
        const payload = JSON.parse(atob(data.access_token.split(".")[1]));

        localStorage.setItem("auth-token", data.access_token);
        localStorage.setItem("auth-tenant-id", tenantId);

        set({
          token: data.access_token,
          tenantId,
          role: payload.role,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("auth-tenant-id");
        set({ token: null, tenantId: null, role: null, isAuthenticated: false });
      },
    }),
    {
      name: "courier-auth",
      partialize: (state) => ({
        token: state.token,
        tenantId: state.tenantId,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
