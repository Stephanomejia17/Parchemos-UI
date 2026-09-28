"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MenuItem } from "@/shared/types/menu";
import { useRestaurantContext } from "@/shared/context/location-context";
import { menuService } from "@/shared/services/menu/menu.service";
import { mapProductToMenuItem } from "@/shared/services/menu/menu-mapper";

export interface OrderLine {
  item: MenuItem;
  quantity: number;
}

interface AddResult {
  ok: boolean;
  reason?: string;
}

interface OrderContextValue {
  lines: OrderLine[];
  subtotal: number;
  totalItems: number;
  availabilityStatus: "loading" | "checked" | "error";
  unavailableLines: OrderLine[];
  refreshAvailability: () => Promise<boolean>;
  addItem: (item: MenuItem) => AddResult;
  removeItem: (itemId: string) => void;
  incrementQuantity: (itemId: string) => void;
  decrementQuantity: (itemId: string) => void;
  quantityOf: (itemId: string) => number;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

function isOrderLine(value: unknown): value is OrderLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<OrderLine>;
  const item = line.item;
  return Boolean(
    item &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof line.quantity === "number" &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0,
  );
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const { restaurantId } = useRestaurantContext();
  const storageKey = `parchemos:order:${restaurantId ?? "default"}`;
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const [availabilityStatus, setAvailabilityStatus] =
    useState<OrderContextValue["availabilityStatus"]>("loading");

  // AC6 — restaura lo que el comensal ya había seleccionado.
  useEffect(() => {
    setHydratedKey(null);
    try {
      const raw =
        window.localStorage.getItem(storageKey) ??
        (restaurantId ? window.localStorage.getItem("parchemos:order") : null);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const validLines = Array.isArray(parsed) ? parsed.filter(isOrderLine) : [];
      setLines(validLines);
    } catch {
      // localStorage vacío, corrupto o bloqueado — arrancamos sin pedido
    } finally {
      setHydratedKey(storageKey);
    }
  }, [restaurantId, storageKey]);

  useEffect(() => {
    if (hydratedKey !== storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(lines));
    } catch {
      // el pedido sigue funcionando en memoria aunque no se persista
    }
  }, [lines, hydratedKey, storageKey]);

  // Revalida los productos guardados contra la disponibilidad actual de la
  // sede antes de habilitar el pago, incluso si se abre directamente /payment.
  useEffect(() => {
    if (!restaurantId || hydratedKey !== storageKey) {
      setAvailabilityStatus("loading");
      return;
    }
    let cancelled = false;
    setAvailabilityStatus("loading");
    menuService
      .listLocationMenu(restaurantId)
      .then((response) => {
        if (cancelled) return;
        const currentProducts = new Map(
          response.data.items.map((product) => [product.id, mapProductToMenuItem(product)]),
        );
        setLines((previous) =>
          previous.map((line) => {
            const current = currentProducts.get(line.item.id);
            return {
              ...line,
              item: current ?? { ...line.item, available: false },
            };
          }),
        );
        setAvailabilityStatus("checked");
      })
      .catch(() => {
        if (!cancelled) setAvailabilityStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId, hydratedKey, storageKey]);

  const addItem = (item: MenuItem): AddResult => {
    // AC2
    if (item.available === false) {
      return { ok: false, reason: "Este producto no está disponible en este momento." };
    }
    setLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) => (l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { item, quantity: 1 }];
    });
    return { ok: true };
  };

  const removeItem = (itemId: string) => {
    // AC4
    setLines((prev) => prev.filter((l) => l.item.id !== itemId));
  };

  const incrementQuantity = (itemId: string) => {
    // AC3
    setLines((prev) =>
      prev.map((l) => (l.item.id === itemId ? { ...l, quantity: l.quantity + 1 } : l)),
    );
  };

  const decrementQuantity = (itemId: string) => {
    // AC3 / AC4 — llega a 0 y se elimina
    setLines((prev) => {
      const line = prev.find((l) => l.item.id === itemId);
      if (line && line.quantity <= 1) {
        return prev.filter((l) => l.item.id !== itemId);
      }
      return prev.map((l) => (l.item.id === itemId ? { ...l, quantity: l.quantity - 1 } : l));
    });
  };

  const quantityOf = (itemId: string) => lines.find((l) => l.item.id === itemId)?.quantity ?? 0;

  const clearOrder = () => setLines([]);

  // AC5 — recalculado en cada cambio de lines
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.item.price * l.quantity, 0),
    [lines],
  );
  const totalItems = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const unavailableLines = useMemo(() => lines.filter((line) => !line.item.available), [lines]);

  const refreshAvailability = useCallback(async () => {
    if (!restaurantId) {
      setAvailabilityStatus("error");
      return false;
    }
    setAvailabilityStatus("loading");
    try {
      const response = await menuService.listLocationMenu(restaurantId);
      const currentProducts = new Map(
        response.data.items.map((product) => [product.id, mapProductToMenuItem(product)]),
      );
      const allAvailable = lines.every(
        (line) => currentProducts.get(line.item.id)?.available === true,
      );
      setLines((previous) =>
        previous.map((line) => ({
          ...line,
          item: currentProducts.get(line.item.id) ?? { ...line.item, available: false },
        })),
      );
      setAvailabilityStatus("checked");
      return allAvailable;
    } catch {
      setAvailabilityStatus("error");
      return false;
    }
  }, [restaurantId, lines]);

  const value: OrderContextValue = {
    lines,
    subtotal,
    totalItems,
    availabilityStatus,
    unavailableLines,
    refreshAvailability,
    addItem,
    removeItem,
    incrementQuantity,
    decrementQuantity,
    quantityOf,
    clearOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder debe usarse dentro de un OrderProvider");
  return ctx;
}
