"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const themeColor = useThemeStore((s) => s.color);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeColor);
  }, [themeColor]);

  return <>{children}</>;
}
