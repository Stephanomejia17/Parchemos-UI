import type { ReactNode } from "react";
import { Star } from "lucide-react";

export function CustomerBadge({ children, color = "orange" }: { children: ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    orange: "bg-orange-100 text-orange-600", green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700", gray: "bg-gray-100 text-gray-600", blue: "bg-blue-100 text-blue-600",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>{children}</span>;
}

export function PrimaryButton({ children, onClick, className = "", size = "md", variant = "primary" }: {
  children: ReactNode; onClick?: () => void; className?: string;
  size?: "sm" | "md" | "lg"; variant?: "primary" | "secondary" | "ghost" | "outline";
}) {
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" };
  const variants = {
    primary: "bg-primary text-white hover:bg-orange-600 shadow-sm", secondary: "bg-secondary text-gray-900 hover:bg-yellow-500",
    ghost: "bg-transparent text-primary hover:bg-orange-50", outline: "border border-primary text-primary hover:bg-orange-50 bg-transparent",
  };
  return <button onClick={onClick} className={`rounded-2xl font-semibold transition-all active:scale-95 ${sizes[size]} ${variants[variant]} ${className}`}>{children}</button>;
}

export function StarRating({ rating, count }: { rating: number; count?: number }) {
  return <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /><span className="text-sm font-semibold text-gray-900">{rating}</span>{count && <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>}</div>;
}
