"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { PrimaryButton } from "@parchemos/shared/components";

const METHODS = [
  { id: "apple", icon: "🍎", label: "Apple Pay", sub: "Visa •••• 4821" },
  { id: "google", icon: "G", label: "Google Pay", sub: "Mastercard •••• 3902" },
  { id: "card", icon: "💳", label: "Tarjeta de crédito", sub: "Agregar tarjeta" },
  { id: "nequi", icon: "N", label: "Nequi", sub: "+57 310 987 6543" },
  { id: "pse", icon: "🏦", label: "PSE", sub: "Bancolombia, Davivienda..." },
  { id: "daviplata", icon: "D", label: "Daviplata", sub: "+57 310 987 6543" },
];

export function Payment() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("apple");
  const [paid, setPaid] = useState(false);

  if (paid) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center px-6 text-center z-50">
        <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-200">
          <Check className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">¡Pagado!</h2>
        <p className="text-muted-foreground mb-8">Tu pago fue procesado exitosamente</p>
        <div className="bg-gray-50 rounded-2xl p-5 w-full max-w-sm mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Restaurante</span>
            <span className="text-sm font-semibold">La Paloma Gastrobar</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total pagado</span>
            <span className="text-sm font-bold text-accent">$155.000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Método</span>
            <span className="text-sm font-semibold">Apple Pay</span>
          </div>
        </div>
        <PrimaryButton onClick={() => router.push("/home")} size="lg" className="w-full max-w-sm">
          Volver al inicio
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 font-heading">Pago</h2>
        </div>
      </div>

      <div className="p-4 md:p-6 md:max-w-3xl md:mx-auto md:w-full">
        <div className="md:grid md:grid-cols-2 md:gap-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-r from-primary to-orange-400 rounded-2xl p-5 text-white">
              <p className="text-sm font-medium opacity-80">Total a pagar</p>
              <p className="text-4xl font-extrabold mt-1">$155.000</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                <p className="text-sm opacity-80">La Paloma Gastrobar · Mesa 12</p>
              </div>
            </div>
            <button
              onClick={() => setPaid(true)}
              className="w-full bg-accent text-white rounded-2xl py-4 font-bold text-base shadow-lg shadow-green-200 hover:bg-green-600 transition-all active:scale-95"
            >
              ✓ Confirmar pago · $155.000
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-semibold text-gray-900 text-sm">Método de pago</p>
            </div>
            {METHODS.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0 border-border transition-colors ${selectedMethod === method.id ? "bg-orange-50" : "hover:bg-gray-50"}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${selectedMethod === method.id ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}>
                  {method.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? "border-primary bg-primary" : "border-gray-300"}`}>
                  {selectedMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
