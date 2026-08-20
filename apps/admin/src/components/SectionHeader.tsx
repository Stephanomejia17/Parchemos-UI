import type { ReactNode } from "react";

export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-[17px] font-semibold text-gray-900">{title}</h2>
        {sub && <p className="text-[13px] text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
