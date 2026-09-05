"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RequireAuth, useAuth } from "@/shared/auth";
import {
  Sidebar,
  BottomNav,
  ActiveTabProvider,
  useActiveTab,
} from "@/shared/components/navigation";
import { NavigationHeader } from "@/shared/components/navigation/NavigationHeader";
import { breadcrumbsForPath, backHrefForPath, navigationForRole } from "@/shared/navigation";

export function CustomerShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth loginPath="/login" allowedRoles={["comensal"]}>
      <CustomerFrame>{children}</CustomerFrame>
    </RequireAuth>
  );
}

function CustomerFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const items = navigationForRole(user?.role);
  return (
    <ActiveTabProvider items={items}>
      <CustomerContent items={items} pathname={pathname} user={user} logout={logout}>
        {children}
      </CustomerContent>
    </ActiveTabProvider>
  );
}

function CustomerContent({
  children,
  items,
  pathname,
  user,
  logout,
}: {
  children: ReactNode;
  items: ReturnType<typeof navigationForRole>;
  pathname: string;
  user: ReturnType<typeof useAuth>["user"];
  logout: () => Promise<void>;
}) {
  const activeId = useActiveTab();
  const breadcrumbs = breadcrumbsForPath(pathname, items);
  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      <Sidebar
        items={items}
        activeId={activeId}
        user={user ?? undefined}
        onLogout={() => void logout()}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <NavigationHeader
          breadcrumbs={breadcrumbs}
          backHref={backHrefForPath(pathname, items.find((item) => item.id === activeId)?.href)}
        />
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-white md:max-w-none md:bg-transparent">
            <div className="min-h-0 flex-1 overflow-hidden md:overflow-y-auto">{children}</div>
            <BottomNav items={items} activeId={activeId} />
          </div>
        </div>
      </div>
    </div>
  );
}
