"use client";

import { Check } from "lucide-react";

export interface FormStep {
  id: string;
  label: string;
}

/**
 * Indicador de progreso para formularios divididos en secciones.
 *
 * No guarda estado: quien lo usa decide en que paso esta y si se puede volver
 * a uno anterior (`onStepSelect`). Los pasos que aun no se han completado
 * nunca son navegables, para no saltarse validaciones.
 */
export function FormStepper({
  steps,
  current,
  onStepSelect,
  className = "",
}: {
  steps: FormStep[];
  /** Indice del paso activo, empezando en 0. */
  current: number;
  /** Si se pasa, los pasos ya superados se vuelven botones. */
  onStepSelect?: (index: number) => void;
  className?: string;
}) {
  return (
    <ol className={`flex items-start ${className}`} aria-label="Progreso del formulario">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const navigable = done && Boolean(onStepSelect);

        return (
          <li key={step.id} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <Track filled={index <= current} hidden={index === 0} />
              <Bullet
                index={index}
                done={done}
                active={active}
                navigable={navigable}
                label={step.label}
                onSelect={() => onStepSelect?.(index)}
              />
              <Track filled={index < current} hidden={index === steps.length - 1} />
            </div>
            <span
              aria-current={active ? "step" : undefined}
              className={`text-center text-[11px] leading-tight ${
                active ? "font-semibold text-gray-900" : done ? "font-medium text-primary" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Track({ filled, hidden }: { filled: boolean; hidden: boolean }) {
  return (
    <span
      aria-hidden
      className={`h-0.5 flex-1 rounded-full transition-colors ${
        hidden ? "bg-transparent" : filled ? "bg-primary" : "bg-gray-200"
      }`}
    />
  );
}

function Bullet({
  index,
  done,
  active,
  navigable,
  label,
  onSelect,
}: {
  index: number;
  done: boolean;
  active: boolean;
  navigable: boolean;
  label: string;
  onSelect: () => void;
}) {
  const content = done ? <Check className="h-4 w-4" /> : index + 1;
  const styles = done
    ? "bg-primary text-white"
    : active
      ? "bg-white text-primary border-2 border-primary ring-4 ring-primary/15"
      : "bg-gray-100 text-gray-400";

  const className = `flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${styles}`;

  if (!navigable) {
    return (
      <span className={className} aria-hidden>
        {content}
      </span>
    );
  }

  return (
    <button type="button" onClick={onSelect} aria-label={`Volver al paso ${label}`} className={`${className} active:scale-95`}>
      {content}
    </button>
  );
}
