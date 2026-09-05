import type { ComponentType, ReactNode } from "react";

/**
 * Bloque de un formulario: una tarjeta con titulo, descripcion y campos.
 *
 * Es el ladrillo con el que se arman los formularios por secciones (registro,
 * perfil de negocio, configuracion...), asi todos comparten el mismo ritmo
 * visual sin repetir clases.
 */
export function FormSection({
  title,
  description,
  icon: Icon,
  footer,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  /** Contenido bajo los campos: botones de navegacion, notas legales, etc. */
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] md:p-6 ${className}`}
    >
      <header className="flex items-start gap-3">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-primary">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-bold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </header>

      <div className="flex flex-col gap-4">{children}</div>

      {footer && <div className="flex flex-col gap-3">{footer}</div>}
    </section>
  );
}
