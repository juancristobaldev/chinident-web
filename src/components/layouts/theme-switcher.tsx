"use client";

import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useThemeStore, ThemeColor } from "@/stores/theme-store";
import { cn } from "@/lib/utils";

const themes: { value: ThemeColor; label: string; color: string }[] = [
  { value: "blue", label: "Azul", color: "#2563EB" },
  { value: "purple", label: "Lila", color: "#7C3AED" },
  { value: "pink", label: "Rosa", color: "#DB2777" },
  { value: "green", label: "Verde", color: "#16A34A" },
  { value: "orange", label: "Naranja", color: "#EA580C" },
  { value: "teal", label: "Turquesa", color: "#0D9488" },
];

export function ThemeSwitcher() {
  const { color, setColor } = useThemeStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => setColor(theme.value)}
            className="flex items-center gap-3"
          >
            <div
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: theme.color }}
            />
            <span>{theme.label}</span>
            {color === theme.value && (
              <span className="ml-auto text-xs text-muted-foreground">Activo</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
