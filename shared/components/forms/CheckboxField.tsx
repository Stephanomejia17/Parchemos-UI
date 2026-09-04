"use client";

import { useId, type ReactNode } from "react";

/** Casilla de aceptacion con etiqueta rica (enlaces, negritas...). */
export function CheckboxField({
  checked,
  onCheckedChange,
  children,
  invalid = false,
  disabled = false,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
  /** Resalta la casilla cuando es obligatoria y sigue sin marcarse. */
  invalid?: boolean;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${
        invalid ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={event => onCheckedChange(event.target.checked)}
        aria-invalid={invalid ? true : undefined}
        className="mt-0.5 h-4 w-4 accent-[color:var(--color-primary,#FF6B35)]"
      />
      <span className="text-xs leading-relaxed text-gray-700">{children}</span>
    </label>
  );
}
