import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Parchemos web app design",
  description:
    "Discover and enjoy culinary experiences with a vibrant marketplace for restaurants, social sharing, reservations, and seamless ordering all in one platform.",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} h-full`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
