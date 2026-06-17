import { create } from "zustand";

export type ThemeColor = "blue" | "purple" | "pink" | "green" | "orange" | "teal";

interface ThemeState {
  color: ThemeColor;
  setColor: (color: ThemeColor) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  color: "blue",
  setColor: (color: ThemeColor) => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", color);
      try { localStorage.setItem("theme-color", color); } catch {}
    }
    set({ color });
  },
}));

if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("theme-color") as ThemeColor | null;
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
    }
  } catch {}
}
