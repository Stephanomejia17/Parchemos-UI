"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { roleHomePath, useAuth } from "@/shared/auth";
import { BrandLogo } from "@/shared/components";

export function Splash() {
  const router = useRouter();
  const { status, user } = useAuth();

  // Mientras se ve el splash, el AuthProvider intenta recuperar la sesión con
  // la cookie httpOnly: quien ya entró no vuelve a pasar por el login.
  useEffect(() => {
    if (status === "loading") return;

    const destination = status === "authenticated" && user ? roleHomePath(user.role) : "/login";
    const t = setTimeout(() => router.replace(destination), 1200);
    return () => clearTimeout(t);
  }, [router, status, user]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <BrandLogo className="h-24 w-24 rounded-3xl shadow-xl shadow-orange-200" />
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 font-heading">Parchemos</h1>
          <p className="text-muted-foreground text-sm mt-1">Descubre. Reserva. Disfruta.</p>
        </div>
      </div>
      <div className="absolute bottom-16 flex gap-1.5">
        <div
          className="w-2 h-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-secondary animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-accent animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
