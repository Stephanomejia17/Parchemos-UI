"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChefHat, ChevronLeft, Minus, Plus, QrCode } from "lucide-react";
import { PrimaryButton } from "@parchemos/shared/components";

const ITEMS = [
  { name: "Double Smash BBQ", qty: 2, price: 36500 },
  { name: "Smash Burger Clásica", qty: 1, price: 28500 },
  { name: "Papas Smash Cargadas", qty: 2, price: 18500 },
  { name: "Milkshake Vainilla", qty: 2, price: 16500 },
];

const STEPS = ["Recibido", "Preparando", "Listo", "Entregado"];

export function OrderSummary() {
  const router = useRouter();
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [guests, setGuests] = useState(2);

  const goPayment = () => router.push("/payment");

  const subtotal = ITEMS.reduce((a, i) => a + i.price * i.qty, 0);
  const service = Math.round(subtotal * 0.1);
  const total = subtotal + service;

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 font-heading">Mi Pedido</h2>
        </div>
      </div>

      <div className="p-4 md:p-6 md:max-w-4xl md:mx-auto md:w-full">
        <div className="md:grid md:grid-cols-2 md:gap-6 flex flex-col gap-4">
          {/* Left col */}
          <div className="flex flex-col gap-4">
            {/* Status */}
            <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-accent/10 rounded-2xl flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Estado del pedido</p>
                  <p className="text-xs text-accent font-semibold">Preparando tu orden...</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-bold text-gray-900">~18 min</p>
                  <p className="text-xs text-muted-foreground">Tiempo estimado</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i <= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>
                      {i <= 1 ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    {i < 3 && <div className={`flex-1 h-0.5 ${i < 1 ? "bg-primary" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {STEPS.map(step => (
                  <span key={step} className="text-xs text-muted-foreground text-center" style={{ width: "25%" }}>
                    {step}
                  </span>
                ))}
              </div>
            </div>

            {/* Split */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Dividir cuenta</p>
                  <p className="text-xs text-muted-foreground">Invita a tus amigos mediante QR</p>
                </div>
                <button onClick={() => setSplitEnabled(!splitEnabled)} className={`w-12 h-6 rounded-full transition-all ${splitEnabled ? "bg-primary" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all mx-0.5 ${splitEnabled ? "translate-x-6" : ""}`} />
                </button>
              </div>
              {splitEnabled && (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Escanea para unirte</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Cada persona paga su parte</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold text-gray-900">{guests} personas</span>
                      <button onClick={() => setGuests(guests + 1)} className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-primary font-bold mt-1">${Math.round(total / guests).toLocaleString()} por persona</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right col */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-gray-900">Resumen del pedido</p>
              </div>
              {ITEMS.map((item, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < ITEMS.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center text-xs font-bold text-primary">{item.qty}</div>
                    <span className="text-sm text-gray-800">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">${(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="px-4 py-3 border-t border-border bg-gray-50">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm text-gray-700">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-muted-foreground">Servicio (10%)</span>
                  <span className="text-sm text-gray-700">${service.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-border">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary text-lg">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <PrimaryButton onClick={goPayment} size="lg" className="w-full">
              💳 Ir a pagar · ${total.toLocaleString()}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
