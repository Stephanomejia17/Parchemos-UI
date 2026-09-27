import type { OrderFulfillment, RoomOrder } from "@/shared/services";
import { formatCop } from "@/shared/utils/currency";

const FULFILLMENT_LABELS: Record<OrderFulfillment, string> = {
  en_mesa: "En mesa",
  para_llevar: "Para llevar",
  domicilio: "Domicilio",
};

const PAYMENT_LABELS: Record<string, string> = {
  pendiente: "Pago pendiente",
  parcial: "Pago parcial",
  pagado: "Pagado",
  reembolsado: "Reembolsado",
};

/** GP-05 CA2: productos, cantidades, modalidad y mesa del pedido. */
export function RoomOrderDetail({ order }: { order: RoomOrder }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
      <dl className="mb-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-gray-500">Modalidad</dt>
          <dd className="font-medium text-gray-900">{FULFILLMENT_LABELS[order.modalidad]}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Mesa</dt>
          <dd className="font-medium text-gray-900">{order.mesa?.codigo ?? "Sin mesa"}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Pago</dt>
          <dd className="font-medium text-gray-900">
            {PAYMENT_LABELS[order.estadoPago] ?? order.estadoPago}
          </dd>
        </div>
      </dl>
      <ul className="space-y-1.5">
        {order.items.map((item, i) => (
          <li key={`${item.nombre}-${i}`} className="flex justify-between gap-3">
            <div className="min-w-0">
              <p className="text-gray-900">
                <span className="font-semibold">{item.cantidad} ×</span> {item.nombre}
              </p>
              {item.notas && <p className="text-xs text-amber-700">Nota: {item.notas}</p>}
            </div>
            <span className="shrink-0 text-gray-700">{formatCop(item.subtotal)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
        <span>Total</span>
        <span>{formatCop(order.total)}</span>
      </div>
    </div>
  );
}
