import { STATUS_COLORS, STATUS_LABELS } from "./status";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
        STATUS_COLORS[status] || "bg-gray-100 text-gray-500 border-gray-200"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
