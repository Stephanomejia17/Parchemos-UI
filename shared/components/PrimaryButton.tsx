import type { ReactNode } from "react";

const SIZES = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" };

const VARIANTS = {
  primary: "bg-primary text-white hover:bg-orange-600 shadow-sm",
  secondary: "bg-secondary text-gray-900 hover:bg-yellow-500",
  ghost: "bg-transparent text-primary hover:bg-orange-50",
  outline: "border border-primary text-primary hover:bg-orange-50 bg-transparent",
};

export function PrimaryButton({
  children,
  onClick,
  className = "",
  size = "md",
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  size?: keyof typeof SIZES;
  variant?: keyof typeof VARIANTS;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl font-semibold transition-all active:scale-95 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
