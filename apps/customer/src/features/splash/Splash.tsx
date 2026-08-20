"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function Splash() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/login"), 2200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-orange-200">
          <span className="text-5xl">🍽️</span>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 font-heading">Parchemos</h1>
          <p className="text-muted-foreground text-sm mt-1">Descubre. Reserva. Disfruta.</p>
        </div>
      </div>
      <div className="absolute bottom-16 flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
