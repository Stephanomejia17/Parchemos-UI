import type { CSSProperties, ReactNode } from "react";

export function SurfaceCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${className}`} style={style}>
      {children}
    </div>
  );
}
