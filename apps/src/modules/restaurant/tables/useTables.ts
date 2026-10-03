"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { tableService } from "@/shared/services/table/table.service";
import { TABLE_STATUS, type Table } from "@/shared/types/table";

function tableErrorMessage(cause: unknown, fallback: string): string {
  const code = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : "";
  if (code === "TABLE_ALREADY_EXISTS" || code === "DUPLICATE_TABLE")
    return "Ya existe una mesa con ese número.";
  if (code === "TABLE_NOT_FOUND") return "La mesa ya no está disponible.";
  return fallback;
}

export function useTables(locationId: string | null) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const loadTables = useCallback(async (id: string) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoadingTables(true);
    setError(null);
    setTables([]);
    try {
      const data = await tableService.listByLocation(id, controller.signal);
      if (!controller.signal.aborted) setTables(data);
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(tableErrorMessage(cause, "No pudimos cargar las mesas de esta sede."));
    } finally {
      if (!controller.signal.aborted) setLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    if (!locationId) {
      requestRef.current?.abort();
      setTables([]);
      setLoadingTables(false);
      return;
    }
    void loadTables(locationId);
    return () => requestRef.current?.abort();
  }, [loadTables, locationId]);

  const createTable = useCallback(
    async (code: string) => {
      if (!locationId) return;
      setSaving(true);
      setError(null);
      try {
        await tableService.create(locationId, code);
        await loadTables(locationId);
      } catch (cause) {
        setError(tableErrorMessage(cause, "No pudimos crear la mesa."));
        throw cause;
      } finally {
        setSaving(false);
      }
    },
    [loadTables, locationId],
  );

  const changeStatus = useCallback(
    async (table: Table) => {
      if (!locationId) return;
      setSaving(true);
      setError(null);
      try {
        const nextStatus =
          table.status === TABLE_STATUS.ACTIVE ? TABLE_STATUS.INACTIVE : TABLE_STATUS.ACTIVE;
        await tableService.updateStatus(table.id, nextStatus);
        await loadTables(locationId);
      } catch (cause) {
        setError(tableErrorMessage(cause, "No pudimos cambiar el estado de la mesa."));
        throw cause;
      } finally {
        setSaving(false);
      }
    },
    [loadTables, locationId],
  );

  return { tables, loadingTables, saving, error, setError, loadTables, createTable, changeStatus };
}
