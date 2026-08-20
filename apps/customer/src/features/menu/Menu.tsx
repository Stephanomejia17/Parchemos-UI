"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, Flame, Minus, Plus, ShoppingBag } from "lucide-react";
import { RemoteImage } from "@/components/media/RemoteImage";
import { MENU_SECTIONS } from "./data";

export function Menu() {
  const router = useRouter();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [activeSection, setActiveSection] = useState(0);

  const goOrderSummary = () => router.push("/order-summary");

  const addToCart = (id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: number) =>
    setCart(prev => {
      const n = (prev[id] || 0) - 1;
      if (n <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: n };
    });
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = MENU_SECTIONS.flatMap(s => s.items).find(i => i.id === parseInt(id));
    return acc + (item ? item.price * qty : 0);
  }, 0);

  return (
    <div className="flex flex-col h-full bg-background md:flex-row">
      {/* Main scrollable area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-gray-900" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-heading">La Paloma Gastrobar</h2>
              <p className="text-xs text-muted-foreground">Menú · 12 opciones</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {MENU_SECTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveSection(i)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex-shrink-0 transition-all ${activeSection === i ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
          {MENU_SECTIONS.map((section, si) => (
            <div key={si}>
              <h3 className="font-bold text-gray-900 mb-3 text-base">{section.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.items.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 border border-border shadow-sm">
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <RemoteImage src={item.img} alt={item.name} className="w-24 h-24 rounded-xl" sizes="96px" />
                        {item.popular && (
                          <div className="absolute -top-1 -left-1 bg-secondary text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-lg">🔥 Popular</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {item.time}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Flame className="w-3.5 h-3.5" />
                            {item.calories} cal
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-primary text-base">${item.price.toLocaleString()}</span>
                          {cart[item.id] ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5 text-gray-700" />
                              </button>
                              <span className="w-5 text-center font-bold text-sm text-gray-900">{cart[item.id]}</span>
                              <button onClick={() => addToCart(item.id)} className="w-7 h-7 bg-primary rounded-xl flex items-center justify-center">
                                <Plus className="w-3.5 h-3.5 text-white" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item.id)}
                              className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-orange-200 hover:bg-orange-600 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cart bar — mobile bottom, hidden when cart sidebar shows on md+ */}
        {totalItems > 0 && (
          <div className="bg-white border-t border-border p-4 md:hidden">
            <button
              onClick={goOrderSummary}
              className="w-full bg-primary text-white rounded-2xl py-4 flex items-center justify-between px-5 shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
            >
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold">{totalItems}</span>
              </div>
              <span className="font-bold">Ver pedido</span>
              <span className="font-bold">${totalPrice.toLocaleString()}</span>
            </button>
          </div>
        )}
      </div>

      {/* Cart sidebar — desktop */}
      <div className="hidden md:flex flex-col w-72 lg:w-80 bg-white border-l border-border flex-shrink-0">
        <div className="px-5 py-4 border-b border-border">
          <p className="font-bold text-gray-900">Tu pedido</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">Tu pedido está vacío</p>
              <p className="text-xs text-muted-foreground">Agrega items del menú para comenzar</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(cart).map(([id, qty]) => {
                const item = MENU_SECTIONS.flatMap(s => s.items).find(i => i.id === parseInt(id));
                if (!item) return null;
                return (
                  <div key={id} className="flex items-center gap-3">
                    <RemoteImage src={item.img} alt={item.name} className="w-12 h-12 rounded-xl flex-shrink-0" sizes="48px" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-primary font-bold mt-0.5">${(item.price * qty).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{qty}</span>
                      <button onClick={() => addToCart(item.id)} className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {totalItems > 0 && (
          <div className="p-5 border-t border-border">
            <div className="flex justify-between mb-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-bold text-primary">${totalPrice.toLocaleString()}</span>
            </div>
            <button
              onClick={goOrderSummary}
              className="w-full bg-primary text-white rounded-2xl py-3.5 font-bold text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
            >
              Ver pedido completo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
