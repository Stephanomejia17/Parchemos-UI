import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({ options, className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[] }) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 [&>option:checked]:bg-primary [&>option:checked]:text-white hover:border-primary ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
