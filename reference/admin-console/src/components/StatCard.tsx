import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { SurfaceCard as Card } from "@parchemos/shared/components";

export function StatCard({
  label,
  value,
  change,
  up,
  icon: Icon,
  accent = false,
  sub,
}: {
  label: string;
  value: string;
  change?: string;
  up?: boolean;
  icon: LucideIcon;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <Card className="p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? "bg-[#FFF1EB]" : "bg-gray-50"}`}>
          <Icon size={17} className={accent ? "text-[#FF6B35]" : "text-gray-400"} />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 text-[11px] font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
            {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {change}
          </span>
        )}
      </div>
      <div className="text-[22px] font-semibold text-gray-900 tracking-tight mb-0.5">{value}</div>
      <div className="text-[13px] text-gray-500">{label}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-1">{sub}</div>}
    </Card>
  );
}
