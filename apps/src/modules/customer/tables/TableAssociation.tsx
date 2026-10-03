"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, X } from "lucide-react";
import { apiFetch } from "@/shared/services/http/api-client";

export type PublicTable = {
  tableId: string;
  tableCode: string;
  locationId: string;
  restaurantId: string;
  restaurantName: string;
};

type Props = {
  locationId: string;
  onAssociated: (table: PublicTable) => void;
};

type Detector = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
};

type DetectorConstructor = new (options?: { formats?: string[] }) => Detector;

function qrTableId(value: string): string | null {
  try {
    const url = new URL(value, window.location.origin);
    return url.searchParams.get("mesa");
  } catch {
    return null;
  }
}

export function TableAssociation({ locationId, onAssociated }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const associate = async (tableId: string) => {
    setLoading(true);
    setError(null);
    try {
      const table = await apiFetch<PublicTable>(`/mesas/${encodeURIComponent(tableId)}/public`);
      if (table.locationId !== locationId) {
        throw new Error("El QR pertenece a otra sede. Escanea el QR de esta sede.");
      }
      onAssociated(table);
      stopCamera();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No pudimos validar la mesa.");
    } finally {
      setLoading(false);
    }
  };

  const submitManual = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = manualCode.trim();
    if (!/^[1-9]\d*$/.test(code)) {
      setError("Ingresa un número de mesa válido.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const table = await apiFetch<PublicTable>(
        `/mesas/public-by-code?locationId=${encodeURIComponent(locationId)}&code=${encodeURIComponent(code)}`,
      );
      onAssociated(table);
      setManualCode("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No encontramos esa mesa.");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setError(null);
    const detectorConstructor = (window as Window & {
      BarcodeDetector?: DetectorConstructor;
    }).BarcodeDetector;
    if (!detectorConstructor) {
      setError("Tu navegador no permite leer QR desde la cámara. Ingresa el número de mesa.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("No se puede acceder a la cámara. Ingresa el número de mesa.");
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setCameraOpen(true);
    } catch {
      setError("No se pudo abrir la cámara. Revisa el permiso o ingresa el número de mesa.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  useEffect(() => {
    if (!cameraOpen || !videoRef.current) return;
    const DetectorClass = (window as Window & {
      BarcodeDetector?: DetectorConstructor;
    }).BarcodeDetector;
    if (!DetectorClass) return;
    const detector = new DetectorClass({ formats: ["qr_code"] });
    let cancelled = false;
    let timer: number | undefined;
    const scan = async () => {
      if (cancelled || !videoRef.current) return;
      try {
        const detected = await detector.detect(videoRef.current);
        const rawValue = detected[0]?.rawValue;
        const tableId = rawValue ? qrTableId(rawValue) : null;
        if (tableId) {
          await associate(tableId);
          return;
        }
      } catch {
        // El detector puede fallar mientras la cámara ajusta el enfoque.
      }
      if (!cancelled) timer = window.setTimeout(() => void scan(), 250);
    };
    void scan();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [cameraOpen]);

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play();
    }
  }, [cameraOpen]);

  useEffect(() => () => stopCamera(), []);

  return (
    <section className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
      <div className="mb-3">
        <p className="font-semibold text-gray-900">Asocia tu mesa</p>
        <p className="mt-1 text-sm text-gray-600">
          Escanea el QR de la mesa o escribe su número antes de confirmar el pedido.
        </p>
      </div>
      {cameraOpen && (
        <div className="mb-3 overflow-hidden rounded-xl bg-black">
          <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
          <button type="button" onClick={stopCamera} className="w-full bg-gray-900 px-3 py-2 text-sm text-white">
            <X className="mr-1 inline h-4 w-4" /> Cerrar cámara
          </button>
        </div>
      )}
      {!cameraOpen && (
        <button
          type="button"
          onClick={() => void startCamera()}
          disabled={loading}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          <Camera className="h-4 w-4" /> Escanear QR con la cámara
        </button>
      )}
      <form onSubmit={(event) => void submitManual(event)} className="flex gap-2">
        <input
          value={manualCode}
          onChange={(event) => setManualCode(event.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          pattern="[1-9][0-9]*"
          placeholder="Número de mesa"
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
          aria-label="Número de mesa"
        />
        <button type="submit" disabled={loading} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          <span className="sr-only">Asociar mesa</span>
        </button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}
    </section>
  );
}




