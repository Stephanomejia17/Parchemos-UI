"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookmarkPlus, ChevronLeft, MapPin, Plus, Share2, Star } from "lucide-react";
import { CustomerBadge, PrimaryButton } from "@/shared/components";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { menuService, type Product } from "@/shared/services/menu/menu.service";
import { restaurantService } from "@/shared/services/restaurant/restaurant.service";
import { getRecommendedItems, mapProductToMenuItem } from "@/shared/services/menu/menu-mapper";
import { useOrder } from "@/shared/context/order-context";
import { useRestaurantContext } from "@/shared/context/location-context";
import type { MenuItem } from "@/shared/types/menu";
const TABS = [
  { key: "menu", label: "Menú" },
  { key: "photos", label: "Fotos" },
  { key: "reviews", label: "Reseñas" },
  { key: "events", label: "Eventos" },
];

function RestaurantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { restaurantId, setRestaurantId } = useRestaurantContext();
  const [tab, setTab] = useState("menu");
  const [toast, setToast] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [location, setLocation] = useState<Awaited<
    ReturnType<typeof restaurantService.getPublicLocation>
  > | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const { subtotal, totalItems, addItem, quantityOf, incrementQuantity, decrementQuantity } =
    useOrder();

  const urlRestaurantId = searchParams.get("locationId") ?? searchParams.get("restaurantId");
  const effectiveRestaurantId = urlRestaurantId ?? restaurantId;

  // Si llegamos con ?restaurantId= en la URL, lo guardamos como el
  // restaurante activo (respaldo para cuando /menu se abra sin el param).
  useEffect(() => {
    if (urlRestaurantId && urlRestaurantId !== restaurantId) {
      setRestaurantId(urlRestaurantId);
    }
  }, [urlRestaurantId, restaurantId, setRestaurantId]);

  useEffect(() => {
    if (!effectiveRestaurantId) return;
    let cancelled = false;
    menuService
      .listLocationMenu(effectiveRestaurantId)
      .then((res) => {
        if (!cancelled) setProducts(res.data.items);
      })
      .catch(() => {
        // Manejo de error omitido a propósito: esta pantalla no depende
        // críticamente del menú para renderizar (solo dos secciones lo usan;
        // el resto del perfil — galería, rating, tags — sigue mockeado).
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveRestaurantId]);

  useEffect(() => {
    if (!effectiveRestaurantId) return;
    let cancelled = false;
    restaurantService
      .getPublicLocation(effectiveRestaurantId)
      .then((profile) => {
        if (!cancelled) setLocation(profile);
      })
      .catch(() => {
        if (!cancelled) setLocation(null);
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveRestaurantId]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("parchemos:favorite-products");
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed.filter((id): id is string => typeof id === "string"));
      }
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  // Propaga el restaurantId al navegar al menú completo.
  const goMenu = (productId?: string) => {
    const query = new URLSearchParams();
    if (effectiveRestaurantId) query.set("locationId", effectiveRestaurantId);
    if (productId) query.set("productId", productId);
    router.push(query.size ? `/menu?${query.toString()}` : "/menu");
  };

  const recommended = getRecommendedItems(products);
  const mostOrdered: MenuItem[] = products.slice(0, 4).map(mapProductToMenuItem);
  const favoriteProducts = products
    .filter((product) => favoriteIds.includes(product.id))
    .map(mapProductToMenuItem);

  const toggleFavorite = (productId: string) => {
    setFavoriteIds((previous) => {
      const next = previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId];
      try {
        window.localStorage.setItem("parchemos:favorite-products", JSON.stringify(next));
      } catch {
        // Se conserva el cambio en memoria aunque el navegador no permita guardarlo.
      }
      return next;
    });
  };

  const handleAdd = (item: MenuItem) => {
    // AC1 / AC2
    const result = addItem(item);
    if (!result.ok && result.reason) {
      setToast(result.reason);
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <div className="relative min-h-40 bg-gray-100 md:min-h-64">
        {location?.coverUrl && !location.coverUrl.includes("placehold.co") && (
          <RemoteImage
            src={location.coverUrl}
            alt={`Portada de ${location.name}`}
            className="h-40 w-full md:h-64"
            sizes="100vw"
          />
        )}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 bg-white/90 rounded-2xl flex items-center justify-center shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-gray-900" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-9 h-9 bg-white/90 rounded-2xl flex items-center justify-center shadow-sm">
            <Share2 className="w-4 h-4 text-gray-900" />
          </button>
          <button className="w-9 h-9 bg-white/90 rounded-2xl flex items-center justify-center shadow-sm">
            <BookmarkPlus className="w-4 h-4 text-gray-900" />
          </button>
        </div>
      </div>

      {/* Info + CTAs */}
      <div className="bg-white px-4 pb-4 pt-4 border-b border-border md:px-6 md:pb-6">
        <div className="md:flex md:items-start md:justify-between md:gap-8">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 md:block">
              <div>
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl font-heading">
                  {location?.name ?? "Restaurante"}
                </h2>
                {location?.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{location.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {location?.address && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {location.address}
                </div>
              )}
              {location && (
                <div
                  className={`flex items-center gap-1 text-xs font-semibold ${location.isOpen ? "text-accent" : "text-muted-foreground"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${location.isOpen ? "bg-accent" : "bg-gray-400"}`}
                  />
                  {location.isOpen ? "Abierto" : "Cerrado"}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 md:mt-0 md:flex-shrink-0 md:w-64">
            <PrimaryButton size="md" className="w-full">
              📅 Reservar
            </PrimaryButton>
            <PrimaryButton size="md" variant="outline" className="w-full" onClick={goMenu}>
              🍴 Ver menú
            </PrimaryButton>
            <PrimaryButton size="md" variant="secondary" className="w-full" onClick={goMenu}>
              🛍️ Pedir ahora
            </PrimaryButton>
            <PrimaryButton size="md" variant="ghost" className="w-full border border-gray-200">
              🪑 Ir a la mesa
            </PrimaryButton>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div role="tablist" aria-label="Información del restaurante" className="flex px-4 md:px-6">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`restaurant-tab-${key}`}
              aria-selected={tab === key}
              aria-controls="restaurant-tabpanel"
              onClick={() => setTab(key)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${tab === key ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        id="restaurant-tabpanel"
        role="tabpanel"
        aria-labelledby={`restaurant-tab-${tab}`}
        className="min-h-64 p-4 md:p-6"
      >
        {tab === "menu" && (
          <>
            {favoriteProducts.length > 0 && (
              <section className="mb-6" aria-labelledby="favorite-products-title">
                <h3 id="favorite-products-title" className="mb-3 font-bold text-gray-900">
                  Mis productos favoritos
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {favoriteProducts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3"
                    >
                      {item.imageUrl && (
                        <RemoteImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-16 w-16 shrink-0 rounded-xl"
                          sizes="64px"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => goMenu(item.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block truncate text-sm font-semibold text-gray-900">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          ${item.price.toLocaleString()}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(item.id)}
                        aria-label={`Quitar ${item.name} de favoritos`}
                        className="rounded-full p-2 text-amber-500"
                      >
                        <Star className="h-5 w-5 fill-amber-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AC10 — recomendaciones */}
            {recommended.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Recomendados para ti</h3>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {recommended.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => goMenu(item.id)}
                      className="w-28 flex-shrink-0 text-left"
                    >
                      {item.imageUrl && (
                        <RemoteImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-28 h-20 rounded-xl"
                          sizes="112px"
                        />
                      )}
                      <p className="text-xs font-semibold text-gray-900 mt-1 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-primary font-bold">
                        ${item.price.toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Productos del menú</h3>
              <button onClick={() => goMenu()} className="text-xs font-semibold text-primary">
                Ver menú completo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mostOrdered.map((item) => {
                const qty = quantityOf(item.id);
                const unavailable = !item.available;
                return (
                  <div
                    key={item.id}
                    className={`flex gap-3 bg-white rounded-2xl p-3 border border-border shadow-sm ${unavailable ? "opacity-60" : ""}`}
                  >
                    {item.imageUrl && (
                      <RemoteImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl flex-shrink-0"
                        sizes="80px"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary text-sm">
                            ${item.price.toLocaleString()}
                          </span>
                          {item.featured && !unavailable && (
                            <CustomerBadge color="yellow">Destacado</CustomerBadge>
                          )}
                          {unavailable && <CustomerBadge color="red">No disponible</CustomerBadge>}
                        </div>
                        {qty === 0 ? (
                          <button
                            onClick={() => handleAdd(item)}
                            disabled={unavailable}
                            className="w-7 h-7 bg-primary rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => decrementQuantity(item.id)}
                              className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center"
                            >
                              <span className="text-gray-700 text-sm leading-none">−</span>
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{qty}</span>
                            <button
                              onClick={() => incrementQuantity(item.id)}
                              disabled={unavailable}
                              aria-label={`Aumentar cantidad de ${item.name}`}
                              className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              {totalItems} producto{totalItems === 1 ? "" : "s"}
            </p>
            <p className="font-bold text-gray-900">${subtotal.toLocaleString()}</p>
          </div>
          <PrimaryButton size="md" onClick={goMenu}>
            Ver pedido
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}

export function Restaurant() {
  return <RestaurantContent />;
}
