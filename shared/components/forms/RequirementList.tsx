import { Check, X } from "lucide-react";

export interface Requirement {
  id: string;
  label: string;
  met: boolean;
}

/**
 * Lista de requisitos que se van marcando en verde a medida que se cumplen.
 * Se usa con las reglas de contraseña (GU-01 Esc. 4), pero sirve para
 * cualquier checklist en vivo.
 */
export function RequirementList({ items, className = "" }: { items: Requirement[]; className?: string }) {
  return (
    <ul className={`flex flex-col gap-1 ${className}`}>
      {items.map(item => (
        <li key={item.id} className={`flex items-center gap-1.5 text-xs ${item.met ? "text-green-600" : "text-gray-500"}`}>
          {item.met ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
