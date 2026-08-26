import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AuthProvider } from "@parchemos/shared/auth";
import { ConsoleShell } from "@/components/ConsoleShell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Parchemos Console",
  description: "Panel de administración de Parchemos: usuarios, restaurantes, moderación, analítica, finanzas y más.",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="h-full">
        <AuthProvider>
          <ConsoleShell>{children}</ConsoleShell>
        </AuthProvider>
      </body>
    </html>
  );
}
