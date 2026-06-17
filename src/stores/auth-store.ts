import { create } from "zustand";
import { api } from "../lib/api";
import type { User } from "../types";
import { useThemeStore, type ThemeColor } from "./theme-store";

export const ROLE_ROUTES: Record<User["role"], string> = {
  ADMIN: "/admin/dashboard",
  OWNER: "/owner/dashboard",
  DENTIST: "/dentist/agenda",
  PATIENT: "/patient/dashboard",
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const data = await api.post<{ user: User }>("/auth/login", { email, password });

    try { localStorage.setItem("user", JSON.stringify(data.user)); } catch {}
    if (data.user.themeColor) {
      useThemeStore.getState().setColor(data.user.themeColor as ThemeColor);
    }

    set({ user: data.user, isAuthenticated: true, isLoading: false });
    return data.user;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {}

    try { localStorage.removeItem("user"); } catch {}
    set({ user: null, isAuthenticated: false, isLoading: false });
    window.location.href = "/auth/login";
  },

  checkAuth: async () => {
    try {
      const user = await api.get<User>("/auth/me");
      try { localStorage.setItem("user", JSON.stringify(user)); } catch {}
      if (user.themeColor) {
        useThemeStore.getState().setColor(user.themeColor as ThemeColor);
      }

      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      try { localStorage.removeItem("user"); } catch {}
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, isAuthenticated: !!user });
  },
}));
