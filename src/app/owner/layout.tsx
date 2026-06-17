"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, ROLE_ROUTES } from "@/stores/auth-store";
import { OwnerSidebar } from "@/components/layouts/owner-sidebar";
import { ThemeSwitcher } from "@/components/layouts/theme-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/auth/login");
      } else if (user && user.role !== "OWNER") {
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
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 shrink-0">
        <OwnerSidebar />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            Panel de Clínica
          </h2>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
