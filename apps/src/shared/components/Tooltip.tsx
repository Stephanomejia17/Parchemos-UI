import { Info } from "lucide-react";

export function Tooltip({ text }: { text: string }) {
  return <span className="group relative inline-flex align-middle" tabIndex={0} aria-label={text}>
    <Info className="h-3.5 w-3.5 cursor-help text-gray-400" aria-hidden="true" />
    <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-56 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-left text-xs font-normal leading-relaxed text-white shadow-lg group-hover:block group-focus:block">{text}</span>
  </span>;
}

