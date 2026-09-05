import type { ComponentType } from "react";

export function IconButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-1.5 rounded-lg transition-colors ${
        danger ? "hover:bg-red-50 text-gray-400 hover:text-red-600" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
      }`}
    >
      <Icon size={14} />
    </button>
  );
}
