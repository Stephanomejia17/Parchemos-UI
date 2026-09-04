"use client";

import { useId, type ComponentType, type InputHTMLAttributes, type ReactNode } from "react";

type NativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className" | "id">;

export interface TextFieldProps extends NativeProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Mensaje de error; cuando existe, el campo se pinta en rojo. */
  error?: string | null;
  /** Ayuda permanente bajo el campo (se oculta si hay error). */
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
  /** Contenido pegado al borde derecho: un boton de mostrar contraseña, por ejemplo. */
  trailing?: ReactNode;
  className?: string;
}

/** Clases del `input` para que todos los campos de la app se vean igual. */
export const fieldInputClass =
  "w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50";

export function TextField({
  label,
  value,
  onValueChange,
  error,
  hint,
  icon: Icon,
  trailing,
  className = "",
  ...inputProps
}: TextFieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-semibold text-gray-600">
        {label}
      </label>

      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />}
        <input
          {...inputProps}
          id={id}
          value={value}
          onChange={event => onValueChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${fieldInputClass} ${Icon ? "pl-11" : ""} ${trailing ? "pr-12" : ""} ${
            error ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-primary"
          }`}
        />
        {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>

      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

/** Error o ayuda de un campo. Se exporta para los campos que no usan `TextField`. */
export function FieldMessage({ id, error, hint }: { id: string; error?: string | null; hint?: string }) {
  if (error) {
    return (
      <span id={`${id}-error`} role="alert" className="text-xs text-red-600">
        {error}
      </span>
    );
  }
  if (hint) {
    return (
      <span id={`${id}-hint`} className="text-xs text-muted-foreground">
        {hint}
      </span>
    );
  }
  return null;
}
