import { io, type Socket } from "socket.io-client";
import { resolveApiOrigin, tokenStore, tryRefresh } from "../http/api-client";
import type { OrderStatus, OrderStatusInfo } from "./order.service";

/** Evento `pedido.estado` que emite la API cuando el restaurante cambia un pedido. */
export interface OrderStatusEvent extends OrderStatusInfo {
  estadoAnterior: OrderStatus;
  notificacionId: string;
}

type Listener = (event: OrderStatusEvent) => void;

const ORDER_STATUS_EVENT = "pedido.estado";
/** Reintentos seguidos tras un rechazo del servidor (token vencido). */
const MAX_AUTH_RETRIES = 2;

const listeners = new Set<Listener>();
let socket: Socket | null = null;
let authRetries = 0;

function connect(): Socket {
  const client = io(`${resolveApiOrigin()}/pedidos`, {
    // Se lee en cada (re)conexion, asi usa el token renovado.
    auth: (cb) => cb({ token: tokenStore.get() }),
    transports: ["websocket", "polling"],
  });

  client.on("connect", () => {
    authRetries = 0;
  });

  client.on(ORDER_STATUS_EVENT, (event: OrderStatusEvent) => {
    listeners.forEach((listener) => listener(event));
  });

  // La API desconecta el socket si el token no es valido: se renueva la
  // sesion y se vuelve a intentar un par de veces.
  client.on("disconnect", (reason) => {
    if (reason !== "io server disconnect" || authRetries >= MAX_AUTH_RETRIES) return;
    authRetries += 1;
    void tryRefresh().then((renewed) => {
      if (renewed && socket === client) client.connect();
    });
  });

  return client;
}

/**
 * GP-08 CA5: escucha en tiempo real los cambios de estado de los pedidos del
 * usuario. Todas las suscripciones comparten un solo socket, que se cierra
 * cuando se va el último suscriptor.
 */
export function subscribeToOrderStatus(listener: Listener): () => void {
  listeners.add(listener);
  socket ??= connect();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && socket) {
      socket.disconnect();
      socket = null;
    }
  };
}
