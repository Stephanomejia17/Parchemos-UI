import type { UserRole } from "@/shared/auth";
import type { OrderStatusChange } from "@/shared/services";
import { ORDER_STATUS_LABELS, formatDateTime } from "./order-status";

const AUTHOR_LABELS: Record<UserRole, string> = {
  comensal: "Tú",
  restaurante: "Restaurante",
  personal_restaurante: "Restaurante",
  repartidor: "Repartidor",
  administrador: "Soporte Parchemos",
};

/** GP-08 CA6: trazabilidad de los cambios de estado, del más reciente al más antiguo. */
export function OrderStatusHistory({ changes }: { changes: OrderStatusChange[] }) {
  // El paso a "borrador" es la creación del carrito: no aporta al comensal.
  const visible = changes.filter((change) => change.hacia !== "borrador").reverse();
  if (visible.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
      <p className="font-semibold text-gray-900 text-sm mb-3">Historial del pedido</p>
      <ol className="flex flex-col">
        {visible.map((change, i) => (
          <li
            key={`${change.hacia}-${change.fecha}`}
            className="relative flex gap-3 pb-4 last:pb-0"
          >
            {i < visible.length - 1 && (
              <span className="absolute left-[5px] top-3 bottom-0 w-px bg-gray-200" aria-hidden />
            )}
            <span
              className={`relative mt-1.5 w-[11px] h-[11px] rounded-full flex-shrink-0 ${i === 0 ? "bg-primary" : "bg-gray-300"}`}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p
                  className={`text-sm ${i === 0 ? "font-semibold text-gray-900" : "text-gray-700"}`}
                >
                  {ORDER_STATUS_LABELS[change.hacia]}
                </p>
                <time className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDateTime(change.fecha)}
                </time>
              </div>
              {change.cambiadoPorRol && (
                <p className="text-xs text-muted-foreground">
                  {AUTHOR_LABELS[change.cambiadoPorRol]}
                </p>
              )}
              {change.nota && <p className="text-xs text-gray-600 mt-0.5">{change.nota}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
