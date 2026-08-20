import { ChevronRight } from "lucide-react";
import { SurfaceCard as Card } from "@parchemos/shared/components";
import { SectionHeader } from "@/components/SectionHeader";
import { SETTINGS_SECTIONS } from "./data";

export function Settings() {
  return (
    <div className="space-y-5">
      <SectionHeader title="Configuración" sub="Roles, comisiones, pagos, integraciones y API" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SETTINGS_SECTIONS.map(s => (
          <Card key={s.title} className="p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-[#FFF1EB] flex items-center justify-center transition-colors">
                <s.icon size={16} className="text-gray-400 group-hover:text-[#FF6B35] transition-colors" />
              </div>
              <h3 className="text-[14px] font-semibold text-gray-900">{s.title}</h3>
            </div>
            <ul className="space-y-2">
              {s.items.map(item => (
                <li key={item} className="flex items-center gap-2 text-[12px] text-gray-600">
                  <ChevronRight size={11} className="text-gray-300" />
                  {item}
                </li>
              ))}
            </ul>
            <button className="mt-4 text-[12px] font-medium text-[#FF6B35] hover:underline">Configurar →</button>
          </Card>
        ))}
      </div>
    </div>
  );
}
