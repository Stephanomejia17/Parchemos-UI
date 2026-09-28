"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export interface SidebarUser {
  fullName?: string | null;
  email?: string | null;
}

const initialOf = (name?: string | null) => (name?.trim()[0] ?? "A").toUpperCase();

export function SidebarUserFooter({
  user,
  collapsed,
  logout,
  redirectTo = "/login",
}: {
  user?: SidebarUser | null;
  collapsed: boolean;
  logout: () => Promise<void>;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  // GU-02 Esc. 5: el cierre de sesión revoca el token en el servidor.
  const onLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    await logout();
    router.replace(redirectTo);
  };

  if (collapsed) return null;

  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
        <span className="text-[11px] font-bold text-gray-600">{initialOf(user?.fullName)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-gray-800 truncate">
          {user?.fullName ?? "Admin"}
        </div>
        <div className="text-[10px] text-gray-400 truncate">{user?.email ?? ""}</div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        disabled={signingOut}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className="text-gray-300 hover:text-gray-600 transition-colors disabled:opacity-50"
      >
        <LogOut size={13} />
      </button>
    </div>
  );
}
