"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, ROLE_ROUTES } from "@/stores/auth-store";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { ThemeSwitcher } from "@/components/layouts/theme-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/auth/login");
      } else if (user && user.role !== "ADMIN") {
        router.replace(ROLE_ROUTES[user.role]);
      }
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background selection:bg-primary/20">
      <aside 
        className={cn(
          "shrink-0 shadow-[1px_0_15px_rgba(0,0,0,0.03)] z-20 transition-all duration-300 ease-in-out border-r",
          isCollapsed ? "w-[80px]" : "w-64"
        )}
      >
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8 z-10 transition-all duration-300">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider hidden sm:block">
              Panel de Administración
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Avatar className="h-9 w-9 shadow-sm border border-border/50 transition-transform hover:scale-105 cursor-pointer">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/10 p-8 scrollbar-thin">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
