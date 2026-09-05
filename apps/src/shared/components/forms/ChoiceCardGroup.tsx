"use client";

import type { ComponentType } from "react";

export interface ChoiceCardOption<T extends string> {
  id: T;
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
}

/**
 * Seleccion unica presentada como tarjetas grandes en vez de radios.
 *
 * Se usa para elegir el tipo de cuenta en el registro, y sirve igual para
 * elegir metodo de pago, tipo de sede o cualquier decision de pocas opciones
 * en la que conviene explicar cada una.
 */
export function ChoiceCardGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  error,
  columns = 2,
  className = "",
}: {
  legend?: string;
  options: ChoiceCardOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string | null;
  columns?: 1 | 2;
  className?: string;
}) {
  return (
    <fieldset className={`flex flex-col gap-2 ${className}`}>
      {legend && <legend className="mb-2 text-xs font-semibold text-gray-600">{legend}</legend>}

      <div role="radiogroup" aria-label={legend} className={`grid gap-3 ${columns === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        {options.map(option => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${
                selected
                  ? "border-primary bg-orange-50 ring-2 ring-primary/20"
                  : error
                    ? "border-red-200 bg-white hover:border-gray-300"
                    : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {option.icon && <option.icon className={`h-5 w-5 ${selected ? "text-primary" : "text-gray-400"}`} />}
              <span className="text-sm font-semibold text-gray-900">{option.label}</span>
              {option.description && (
                <span className="text-xs leading-snug text-muted-foreground">{option.description}</span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
