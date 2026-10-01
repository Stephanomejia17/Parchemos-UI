"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus, ShoppingBag, Star, Trash2, X } from "lucide-react";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { CustomerBadge } from "@/shared/components";
import { menuService, type Product } from "@/shared/services/menu/menu.service";
import {
  groupProductsIntoSections,
  getRecommendedItems,
  mapProductToMenuItem,
} from "@/shared/services/menu/menu-mapper";
import { useOrder } from "@/shared/context/order-context";
import { useRestaurantContext } from "@/shared/context/location-context";
import type { MenuItem } from "@/shared/types/menu";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/shared/constants";

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { restaurantId, setRestaurantId } = useRestaurantContext();
  const [toast, setToast] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>([]);
  const [favoritesHydrated, setFavoritesHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    lines,
    subtotal,
    totalItems,
    addItem,
    removeItem,
    incrementQuantity,
    decrementQuantity,
    quantityOf,
  } = useOrder();

  const urlRestaurantId = searchParams.get("locationId") ?? searchParams.get("restaurantId");
  const requestedProductId = searchParams.get("productId");
  const effectiveRestaurantId = urlRestaurantId ?? restaurantId;

  useEffect(() => {
    if (urlRestaurantId && urlRestaurantId !== restaurantId) {
      setRestaurantId(urlRestaurantId);
    }
  }, [urlRestaurantId, restaurantId, setRestaurantId]);

  useEffect(() => {
    if (!effectiveRestaurantId) return;
    let cancelled = false;
    setError(null);
    setProducts(null);
    menuService
      .listLocationMenu(effectiveRestaurantId)
      .then((res) => {
        if (!cancelled) setProducts(res.data.items);
      })
      .catch(() => {
        if (!cancelled) setError("No pudimos cargar el menú. Intenta de nuevo.");
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
        setFavoriteProductIds(parsed.filter((id): id is string => typeof id === "string"));
      }
    } catch {
      setFavoriteProductIds([]);
    } finally {
      setFavoritesHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!favoritesHydrated) return;
    try {
      window.localStorage.setItem(
        "parchemos:favorite-products",
        JSON.stringify(favoriteProductIds),
      );
    } catch {
      // Favoritos disponibles en memoria si el navegador bloquea localStorage.
    }
  }, [favoriteProductIds, favoritesHydrated]);

  useEffect(() => {
    if (!products || !requestedProductId) return;
    const product = products.find((candidate) => candidate.id === requestedProductId);
    if (product) setSelectedProduct(mapProductToMenuItem(product));
  }, [products, requestedProductId]);

  const goOrderSummary = () => router.push("/order-summary");

  const handleAdd = (item: MenuItem) => {
    const result = addItem(item);
    if (!result.ok && result.reason) {
      setToast(result.reason);
      setTimeout(() => setToast(null), 2500);
    }
  };

  if (!effectiveRestaurantId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-2">
        <p className="font-semibold text-gray-900">No encontramos un restaurante seleccionado</p>
        <p className="text-sm text-muted-foreground">
          Vuelve a elegir un restaurante para ver su menú.
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-2">
        <p className="font-semibold text-gray-900">{error}</p>
      </div>
    );
  }
  if (!products) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Cargando menú…</p>
      </div>
    );
  }

  const sections = groupProductsIntoSections(products);
  const recommended = getRecommendedItems(products);
  const featuredItems = products
    .filter((product) => product.featured && product.status === "activo")
    .map(mapProductToMenuItem);

  const toggleFavorite = (productId: string) => {
    setFavoriteProductIds((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId],
    );
  };

  return (
    <div className="flex flex-col h-full bg-background md:flex-row">
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
          {featuredItems.length > 0 && (
            <section aria-labelledby="featured-products-title">
              <h3 id="featured-products-title" className="mb-3 text-base font-bold text-gray-900">
                Productos destacados
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {featuredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedProduct(item)}
                    className="w-32 shrink-0 text-left"
                    aria-label={`Consultar producto destacado ${item.name}`}
                  >
                    <RemoteImage
                      src={item.imageUrl ?? PLACEHOLDER_PRODUCT_IMAGE}
                      alt={item.name}
                      className="h-24 w-32 rounded-xl"
                      sizes="128px"
                    />
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs font-bold text-primary">${item.price.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </section>
          )}
          {recommended.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-base">Recomendados para ti</h3>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {recommended.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedProduct(item)}
                    className="w-32 flex-shrink-0 text-left"
                    aria-label={`Consultar ${item.name}`}
                  >
                    <RemoteImage
                      src={item.imageUrl ?? PLACEHOLDER_PRODUCT_IMAGE}
                      alt={item.name}
                      className="w-32 h-24 rounded-xl"
                      sizes="128px"
                    />
                    <p className="text-xs font-semibold text-gray-900 mt-1 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-primary font-bold">${item.price.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-gray-900 mb-3 text-base">{section.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.items.map((item) => {
                  const qty = quantityOf(item.id);
                  const unavailable = !item.available;
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-4 border border-border shadow-sm ${unavailable ? "opacity-60" : ""}`}
                    >
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            className="relative block text-left"
                            onClick={() => setSelectedProduct(item)}
                            aria-label={`Ver información de ${item.name}`}
                          >
                            <RemoteImage
                              src={item.imageUrl ?? PLACEHOLDER_PRODUCT_IMAGE}
                              alt={item.name}
                              className="w-24 h-24 rounded-xl"
                              sizes="96px"
                            />
                            {item.featured && (
                              <div className="absolute -top-1 -left-1 bg-secondary text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-lg">
                                🔥 Popular
                              </div>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFavorite(item.id)}
                            aria-pressed={favoriteProductIds.includes(item.id)}
                            aria-label={`${favoriteProductIds.includes(item.id) ? "Quitar" : "Agregar"} ${item.name} ${favoriteProductIds.includes(item.id) ? "de" : "a"} favoritos`}
                            className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-amber-500 shadow"
                          >
                            <Star
                              className={`h-4 w-4 ${favoriteProductIds.includes(item.id) ? "fill-amber-400" : ""}`}
                            />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(item)}
                            className="font-semibold text-gray-900 text-left"
                          >
                            {item.name}
                          </button>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {item.description}
                          </p>
                          {unavailable && (
                            <div className="mt-2">
                              <CustomerBadge color="red">No disponible</CustomerBadge>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold text-primary text-base">
                              ${item.price.toLocaleString()}
                            </span>
                            {qty ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => decrementQuantity(item.id)}
                                  className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5 text-gray-700" />
                                </button>
                                <span className="w-5 text-center font-bold text-sm text-gray-900">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => incrementQuantity(item.id)}
                                  disabled={unavailable}
                                  aria-label={`Aumentar cantidad de ${item.name}`}
                                  className="w-7 h-7 bg-primary rounded-xl flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Plus className="w-3.5 h-3.5 text-white" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAdd(item)}
                                disabled={unavailable}
                                className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-orange-200 hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:shadow-none"
                              >
                                <Plus className="w-4 h-4 text-white" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {toast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
            {toast}
          </div>
        )}

        {selectedProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="presentation"
            onClick={() => setSelectedProduct(null)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-detail-title"
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative">
                <RemoteImage
                  src={selectedProduct.imageUrl ?? PLACEHOLDER_PRODUCT_IMAGE}
                  alt={selectedProduct.name}
                  className="h-56 w-full"
                  sizes="448px"
                />
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  aria-label="Cerrar información del producto"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedProduct.id)}
                  aria-pressed={favoriteProductIds.includes(selectedProduct.id)}
                  aria-label={`${favoriteProductIds.includes(selectedProduct.id) ? "Quitar de" : "Agregar a"} favoritos`}
                  className="absolute right-14 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-amber-500 shadow"
                >
                  <Star
                    className={`h-5 w-5 ${favoriteProductIds.includes(selectedProduct.id) ? "fill-amber-400" : ""}`}
                  />
                </button>
                {selectedProduct.featured && (
                  <span className="absolute bottom-3 left-3 rounded-lg bg-secondary px-2 py-1 text-xs font-bold text-gray-900">
                    🔥 Destacado
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 id="product-detail-title" className="text-xl font-bold text-gray-900">
                  {selectedProduct.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {selectedProduct.description || "Sin descripción disponible."}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    ${selectedProduct.price.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleAdd(selectedProduct);
                      if (selectedProduct.available) setSelectedProduct(null);
                    }}
                    disabled={!selectedProduct.available}
                    className="rounded-xl bg-primary px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {selectedProduct.available ? "Agregar al pedido" : "No disponible"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

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
              <span className="font-bold">${subtotal.toLocaleString()}</span>
            </button>
          </div>
        )}
      </div>

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
              {lines.map(({ item, quantity }) => (
                <div key={item.id} className="flex items-center gap-3">
                  <RemoteImage
                    src={item.imageUrl ?? PLACEHOLDER_PRODUCT_IMAGE}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl flex-shrink-0"
                    sizes="48px"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-primary font-bold mt-0.5">
                      ${(item.price * quantity).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label={`Eliminar ${item.name} del pedido`}
                      className="w-6 h-6 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => decrementQuantity(item.id)}
                      className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => incrementQuantity(item.id)}
                      className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {totalItems > 0 && (
          <div className="p-5 border-t border-border">
            <div className="flex justify-between mb-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-bold text-primary">${subtotal.toLocaleString()}</span>
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

export function Menu() {
  return <MenuContent />;
}
