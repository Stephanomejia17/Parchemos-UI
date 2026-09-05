import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

export type FormAlertType = "error" | "success" | "warning" | "info";

const TONES = {
  error: { box: "bg-red-50 text-red-700", Icon: AlertCircle, role: "alert" },
  success: { box: "bg-green-50 text-green-800", Icon: CheckCircle2, role: "status" },
  warning: { box: "bg-amber-50 text-amber-800", Icon: TriangleAlert, role: "status" },
  info: { box: "bg-blue-50 text-blue-800", Icon: Info, role: "status" },
} as const;

/**
 * Aviso en linea dentro de un formulario. A diferencia de `TemporaryMessage`,
 * no es un modal ni desaparece solo: acompaña al campo o al formulario
 * mientras el problema siga ahi.
 */
export function FormAlert({
  type = "error",
  messages,
  children,
  className = "",
}: {
  type?: FormAlertType;
  /** Varios mensajes (los `details` que devuelve la API) se pintan como lista. */
  messages?: string[];
  children?: ReactNode;
  className?: string;
}) {
  const tone = TONES[type];
  if (!children && !messages?.length) return null;

  return (
    <div role={tone.role} className={`flex gap-2.5 rounded-2xl px-4 py-3 text-sm ${tone.box} ${className}`}>
      <tone.Icon className="mt-0.5 h-4 w-4 shrink-0" />
      {messages?.length ? (
        <ul className="flex flex-col gap-1">
          {messages.map(message => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-1">{children}</div>
      )}
    </div>
  );
}
