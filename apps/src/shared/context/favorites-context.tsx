"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/shared/auth";
import { favoriteService } from "@/shared/services/favorites/favorite.service";

interface FavoritesContextValue {
  /** `true` cuando ya se intentó cargar la lista inicial (con o sin éxito). */
  ready: boolean;
  isFavorite: (locationId: string) => boolean;
  /** `true` mientras se guarda el cambio de esa sede (el botón se bloquea). */
  isPending: (locationId: string) => boolean;
  toggle: (locationId: string) => Promise<void>;
  /** Mensaje del último fallo al guardar, para mostrarlo al usuario. */
  error: string | null;
  clearError: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/**
 * Estado de favoritos del comensal compartido por todas las pantallas: el
 * corazón de una tarjeta, el del detalle y "Mis favoritos" siempre coinciden.
 *
 * El cambio se ve al instante (optimista) y se revierte si el servidor falla.
 * Mientras una sede tiene un cambio en curso su botón se bloquea, así un doble
 * clic no envía peticiones cruzadas y lo mostrado coincide con lo guardado
 * (CA8). Sin sesión (401) se lleva al usuario a iniciar sesión (CA9).
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // Doble barrera para el mismo clic: el estado de React llega un render tarde.
  const inFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    const controller = new AbortController();
    favoriteService
      .list(controller.signal)
      .then(({ items }) => setIds(new Set(items.map((item) => item.id))))
      .catch(() => {
        /* sin lista inicial los corazones salen vacíos; el toggle sigue funcionando */
      })
      .finally(() => {
        if (!controller.signal.aborted) setReady(true);
      });
    return () => controller.abort();
  }, []);

  const toggle = useCallback(
    async (locationId: string) => {
      if (inFlight.current.has(locationId)) return;
      inFlight.current.add(locationId);
      setPending((current) => new Set(current).add(locationId));

      const wasFavorite = ids.has(locationId);
      const apply = (favorite: boolean) =>
        setIds((current) => {
          const next = new Set(current);
          if (favorite) next.add(locationId);
          else next.delete(locationId);
          return next;
        });

      apply(!wasFavorite);
      try {
        if (wasFavorite) await favoriteService.remove(locationId);
        else await favoriteService.add(locationId);
        setError(null);
      } catch (cause) {
        apply(wasFavorite);
        if (cause instanceof ApiError && cause.status === 401) {
          router.push("/login");
        } else {
          setError(
            cause instanceof ApiError
              ? cause.message
              : "No pudimos actualizar tus favoritos. Inténtalo de nuevo.",
          );
        }
      } finally {
        inFlight.current.delete(locationId);
        setPending((current) => {
          const next = new Set(current);
          next.delete(locationId);
          return next;
        });
      }
    },
    [ids, router],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ready,
      isFavorite: (locationId) => ids.has(locationId),
      isPending: (locationId) => pending.has(locationId),
      toggle,
      error,
      clearError: () => setError(null),
    }),
    [ready, ids, pending, toggle, error],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites debe usarse dentro de FavoritesProvider.");
  return context;
}
