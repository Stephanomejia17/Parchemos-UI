import type { ReactNode } from "react";
import { ActiveTabProvider } from "@/components/nav/active-tab-context";
import { Sidebar } from "@/components/nav/Sidebar";
import { DesktopHeader } from "@/components/nav/DesktopHeader";
import { BottomNav } from "@/components/nav/BottomNav";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <ActiveTabProvider>
      <div className="w-full h-full flex bg-background overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DesktopHeader />

          <div className="flex-1 min-h-0 overflow-hidden relative">
            {/* Mobile: centered "phone" card with bottom nav. Desktop: same content, full width, no card chrome. */}
            <div className="h-full max-w-md md:max-w-none mx-auto w-full bg-white md:bg-transparent overflow-hidden flex flex-col">
              <div className="flex-1 min-h-0 overflow-hidden md:overflow-y-auto">{children}</div>
              <div className="md:hidden">
                <BottomNav />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ActiveTabProvider>
  );
}
