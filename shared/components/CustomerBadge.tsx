import type { ReactNode } from "react";

const COLORS: Record<string, string> = {
  orange: "bg-orange-100 text-orange-600",
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-blue-100 text-blue-600",
};

export function CustomerBadge({ children, color = "orange" }: { children: ReactNode; color?: string }) {
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${COLORS[color]}`}>{children}</span>;
}
