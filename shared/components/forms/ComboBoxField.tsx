"use client";

import { useEffect, useId, useMemo, useRef, useState, type ComponentType } from "react";
import { Check, ChevronDown } from "lucide-react";
import { FieldMessage, fieldInputClass } from "./TextField";

export interface ComboBoxOption {
  value: string;
  label: string;
  /** Texto secundario (el departamento de una ciudad, por ejemplo). */
  description?: string;
}

/**
 * Desplegable con busqueda que ademas acepta texto libre.
 *
 * La lista cubre los casos habituales y evita erratas, pero quien no se
 * encuentre en ella puede escribir su propio valor: por eso es un combo y no
 * un `select`. Lo usan la ciudad del registro y del perfil, y sirve para
 * cualquier catalogo abierto (categorias de cocina, alergias, etc.).
 */
export function ComboBoxField({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  error,
  hint,
  icon: Icon,
  allowCustomValue = true,
  emptyMessage = "No encontramos coincidencias. Puedes escribirlo tal cual.",
  disabled = false,
  maxLength,
  className = "",
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: ComboBoxOption[];
  placeholder?: string;
  error?: string | null;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
  /** Si es false, salir del campo con un valor fuera de la lista lo descarta. */
  allowCustomValue?: boolean;
  emptyMessage?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  // Mientras el desplegable esta cerrado se muestra el valor elegido; al
  // abrirlo, lo que el usuario va escribiendo filtra la lista.
  const inputValue = open ? query : value;

  const matches = useMemo(() => {
    const needle = normalize(open ? query : "");
    if (!needle) return options;
    return options.filter(
      option => normalize(option.label).includes(needle) || normalize(option.description ?? "").includes(needle),
    );
  }, [open, query, options]);

  useEffect(() => {
    setHighlighted(0);
  }, [query, open]);

  const commit = (raw: string) => {
    const text = raw.trim();
    const exact = options.find(option => normalize(option.label) === normalize(text));
    if (exact) onValueChange(exact.value);
    else if (allowCustomValue) onValueChange(text);
    else onValueChange("");
    setOpen(false);
  };

  // Un clic fuera cierra la lista y conserva lo escrito si se permite.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      commit(query);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  });

  const select = (option: ComboBoxOption) => {
    onValueChange(option.value);
    setOpen(false);
  };

  const openList = () => {
    if (disabled) return;
    setQuery(value);
    setOpen(true);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      <label htmlFor={id} className="text-xs font-semibold text-gray-600">
        {label}
      </label>

      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />}
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
          value={inputValue}
          onFocus={openList}
          onChange={event => {
            if (!open) setOpen(true);
            setQuery(event.target.value);
          }}
          onKeyDown={event => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              if (!open) openList();
              else setHighlighted(index => Math.min(index + 1, matches.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlighted(index => Math.max(index - 1, 0));
            } else if (event.key === "Enter" && open) {
              event.preventDefault();
              const option = matches[highlighted];
              if (option) select(option);
              else commit(query);
            } else if (event.key === "Escape" && open) {
              event.preventDefault();
              setOpen(false);
            } else if (event.key === "Tab" && open) {
              commit(query);
            }
          }}
          className={`${fieldInputClass} ${Icon ? "pl-11" : ""} pr-11 ${
            error ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-primary"
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "Cerrar lista" : "Ver opciones"}
          disabled={disabled}
          onClick={() => (open ? commit(query) : openList())}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-lg"
          >
            {matches.length === 0 && <li className="px-4 py-3 text-xs text-muted-foreground">{emptyMessage}</li>}
            {matches.map((option, index) => {
              const selected = normalize(option.value) === normalize(value);
              return (
                <li key={option.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    // El input pierde el foco antes del click: con onMouseDown la seleccion no se cancela.
                    onMouseDown={event => {
                      event.preventDefault();
                      select(option);
                    }}
                    onMouseEnter={() => setHighlighted(index)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      index === highlighted ? "bg-orange-50" : "bg-white"
                    }`}
                  >
                    <span className="flex flex-col">
                      <span className="font-medium text-gray-900">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      )}
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

/** Marcas diacriticas que deja sueltas `normalize("NFD")`. */
const DIACRITICS = /[̀-ͯ]/g;

/** Compara ignorando mayusculas y tildes: "medellin" encuentra "Medellín". */
function normalize(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(DIACRITICS, "");
}
