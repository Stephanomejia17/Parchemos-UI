"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/shared/auth";
import { sharedTableOrderService } from "@/shared/services";
import { TableAssociation, type PublicTable } from "./TableAssociation";

type Props = {
  open: boolean;
  locationId: string;
  mode: "choose" | "required";
  startWithNumberEntry?: boolean;
  loginReturnTo: string;
  onDismiss: () => void;
  onLinked: (table: PublicTable) => void;
};

export function TableLinkDialog({
  open,
  locationId,
  mode,
  startWithNumberEntry = false,
  loginReturnTo,
  onDismiss,
  onLinked,
}: Props) {
  const { user, status } = useAuth();
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState("");
  const [showNumberEntry, setShowNumberEntry] = useState(
    mode === "required" || startWithNumberEntry,
  );

  useEffect(() => {
    if (open && startWithNumberEntry) setShowNumberEntry(true);
  }, [open, startWithNumberEntry]);

  if (!open) return null;

  const startLinking = () => {
    setError("");
    setShowNumberEntry(true);
  };

  const linkTable = async (table: PublicTable) => {
    if (status !== "authenticated" || user?.role !== "comensal") {
      setError("Inicia sesión con una cuenta de comensal para vincularte a la mesa.");
      return;
    }
    setLinking(true);
    setError("");
    try {
      await sharedTableOrderService.join(table.tableId);
      window.localStorage.setItem("parchemos:mesa", table.tableId);
      window.localStorage.setItem("parchemos:location", table.locationId);
      window.localStorage.setItem("parchemos:activeLocation", table.locationId);
      onLinked(table);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No pudimos vincularte a esta mesa. Inténtalo de nuevo.",
      );
    } finally {
      setLinking(false);
    }
  };

  const loginHref = `/login?returnTo=${encodeURIComponent(loginReturnTo)}`;
  const isComensal = status === "authenticated" && user?.role === "comensal";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !linking) onDismiss();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-link-title"
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onDismiss}
          disabled={linking}
          aria-label="Cerrar diálogo"
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>
        {showNumberEntry && mode === "choose" && (
          <button
            type="button"
            onClick={() => setShowNumberEntry(false)}
            disabled={linking}
            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a las opciones
          </button>
        )}
        <h2 id="table-link-title" className="pr-8 text-xl font-bold text-gray-900">
          {showNumberEntry
            ? mode === "required"
              ? "Vincúlate para realizar tu pedido"
              : "Vincularme a una mesa"
            : "¿Cómo quieres continuar?"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {showNumberEntry
            ? "Ingresa el número de la mesa de esta sede. Vincularte es necesario para pedir, pero no para consultar el menú."
            : "Puedes vincularte ahora o seguir explorando el menú sin asociarte a una mesa."}
        </p>

        {showNumberEntry && (
          <div className="mt-5">
            {status === "loading" && (
              <p role="status" className="text-sm text-gray-500">
                Verificando tu sesión…
              </p>
            )}
            {status !== "loading" && !isComensal && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm text-orange-900">
                  Para vincularte necesitas iniciar sesión con una cuenta de comensal.
                </p>
                <Link
                  href={loginHref}
                  className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
            {isComensal && (
              <TableAssociation
                locationId={locationId}
                manualOnly
                onAssociated={(table) => void linkTable(table)}
              />
            )}
            {linking && (
              <p role="status" className="mt-3 text-sm text-gray-600">
                Vinculándote a la mesa…
              </p>
            )}
            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>
        )}

        {!showNumberEntry && (
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={startLinking}
              className="min-h-12 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:brightness-95"
            >
              Vincularme a una mesa
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="min-h-12 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Solo quiero ver el menú
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
