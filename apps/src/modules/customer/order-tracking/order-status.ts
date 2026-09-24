import type { OrderFulfillment, OrderStatus } from "@/shared/services";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  borrador: "Sin confirmar",
  pendiente: "Recibido",
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  listo: "Listo",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  borrador: "Aún no has confirmado este pedido.",
  pendiente: "El restaurante recibió tu pedido.",
  confirmado: "El restaurante aceptó tu pedido.",
  en_preparacion: "La cocina está preparando tu pedido.",
  listo: "¡Tu pedido está listo!",
  en_camino: "Tu pedido va en camino.",
  entregado: "Tu pedido fue entregado. ¡Buen provecho!",
  cancelado: "Este pedido fue cancelado.",
};

interface TimelineStep {
  label: string;
  /** Estados que se muestran como este paso de la línea de tiempo. */
  states: OrderStatus[];
}

/** Pasos visibles para el comensal; los domicilios agregan "En camino". */
export function timelineFor(fulfillment: OrderFulfillment): TimelineStep[] {
  const steps: TimelineStep[] = [
    { label: "Recibido", states: ["pendiente", "confirmado"] },
    { label: "Preparando", states: ["en_preparacion"] },
    { label: "Listo", states: ["listo"] },
  ];
  if (fulfillment === "domicilio") steps.push({ label: "En camino", states: ["en_camino"] });
  steps.push({ label: "Entregado", states: ["entregado"] });
  return steps;
}

/** Índice del paso actual en la línea de tiempo, o -1 si no aplica. */
export function currentStepIndex(fulfillment: OrderFulfillment, status: OrderStatus): number {
  return timelineFor(fulfillment).findIndex((step) => step.states.includes(status));
}

const DATE_TIME = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDateTime(value: string | null): string {
  return value ? DATE_TIME.format(new Date(value)) : "";
}
