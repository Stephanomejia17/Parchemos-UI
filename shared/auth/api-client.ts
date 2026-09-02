import { ApiError } from "./types";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api").replace(/\/$/, "");

/**
 * El access token vive solo en memoria.
 *
 * A proposito no se guarda en localStorage: cualquier script inyectado en la
 * pagina podria leerlo de ahi. La sesion sobrevive a un F5 gracias a la cookie
 * httpOnly del refresh token, que JavaScript no puede tocar.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
};

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  formData?: FormData;
  /** Interno: evita bucles infinitos al reintentar tras refrescar. */
  skipRefresh?: boolean;
  signal?: AbortSignal;
}

async function raw(path: string, options: RequestOptions = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    // Imprescindible para que viaje la cookie del refresh token.
    credentials: "include",
    body: options.formData ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
    signal: options.signal,
  });
}

/**
 * Llama a la API y, si el access token expiro, lo renueva una sola vez y
 * reintenta. Para el usuario la sesion es continua durante 30 dias aunque el
 * token de acceso dure 15 minutos.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await raw(path, options);

  if (response.status === 401 && !options.skipRefresh && path !== "/auth/refresh") {
    const renewed = await tryRefresh();
    if (renewed) {
      response = await raw(path, { ...options, skipRefresh: true });
    }
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Intenta renovar la sesion con la cookie httpOnly. */
export async function tryRefresh(): Promise<boolean> {
  try {
    const response = await raw("/auth/refresh", { method: "POST", skipRefresh: true });
    if (!response.ok) {
      accessToken = null;
      return false;
    }
    const data = (await response.json()) as { accessToken: string };
    accessToken = data.accessToken;
    return true;
  } catch {
    accessToken = null;
    return false;
  }
}

export function requestPasswordReset(email: string): Promise<void> {
  return apiFetch<void>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function resetPassword(token: string, password: string): Promise<void> {
  return apiFetch<void>("/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  let response = await raw(path, { method: "POST", formData });
  if (response.status === 401) {
    const renewed = await tryRefresh();
    if (renewed) response = await raw(path, { method: "POST", formData });
  }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/**
 * Normaliza la respuesta de error de Nest, que puede llegar como string o como
 * objeto con `message`, `code` y `reason`.
 */
async function toApiError(response: Response): Promise<ApiError> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    /* respuesta sin cuerpo */
  }

  const inner = (payload as { message?: unknown })?.message ?? payload;

  if (typeof inner === "string") {
    return new ApiError(inner, response.status);
  }

  if (inner && typeof inner === "object") {
    const obj = inner as { message?: unknown; code?: string; reason?: string };
    // Errores de validacion: Nest devuelve un arreglo de mensajes.
    if (Array.isArray(obj.message)) {
      const details = obj.message.map(String);
      return new ApiError(details[0] ?? "Revisa los datos ingresados.", response.status, undefined, undefined, details);
    }
    return new ApiError(
      typeof obj.message === "string" ? obj.message : fallbackMessage(response.status),
      response.status,
      obj.code,
      obj.reason,
    );
  }

  return new ApiError(fallbackMessage(response.status), response.status);
}

function fallbackMessage(status: number): string {
  if (status === 429) return "Demasiados intentos. Espera un momento e intentalo de nuevo.";
  if (status >= 500) return "No pudimos conectar con el servidor. Intentalo mas tarde.";
  return "No pudimos completar la operacion.";
}
