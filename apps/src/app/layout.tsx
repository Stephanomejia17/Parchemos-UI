import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/shared/auth";
import "../../global.css";

export const metadata: Metadata = {
  title: "Parchemos web app design",
  description:
    "Discover and enjoy culinary experiences with a vibrant marketplace for restaurants, social sharing, reservations, and seamless ordering all in one platform.",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
