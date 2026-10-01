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
import { useAuth } from "@/shared/auth/auth-context";
import type { MenuItem } from "@/shared/types/menu";
import type { LocationReview } from "@/shared/services/restaurant/restaurant.service";
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
        {tab === "reviews" && effectiveRestaurantId && (
          <RestaurantReviews
            locationId={effectiveRestaurantId}
            locationName={location?.name ?? "este restaurante"}
          />
        )}
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

function RestaurantReviews({
  locationId,
  locationName,
}: {
  locationId: string;
  locationName: string;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<LocationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);

  const currentReview = reviews.find((review) => review.userId === user?.id);
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      setReviews(await restaurantService.listLocationReviews(locationId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las reseñas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    restaurantService
      .listLocationReviews(locationId)
      .then((data) => {
        if (active) setReviews(data);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(cause instanceof Error ? cause.message : "No se pudieron cargar las reseñas.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locationId]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const normalizedComment = comment.trim();
    if (rating < 3 && normalizedComment.length < 10) {
      setError(
        "Para una calificación menor a 3 estrellas, escribe un comentario de al menos 10 caracteres.",
      );
      return;
    }
    if (normalizedComment && normalizedComment.length < 10) {
      setError("El comentario debe tener al menos 10 caracteres.");
      return;
    }
    if (normalizedComment.length > 500) {
      setError("El comentario no puede superar los 500 caracteres.");
      return;
    }
    setSaving(true);
    try {
      if (editing && currentReview) {
        await restaurantService.updateLocationReview(currentReview.id, normalizedComment);
      } else {
        await restaurantService.createLocationReview(
          locationId,
          rating,
          normalizedComment || undefined,
        );
      }
      setEditing(false);
      setComment("");
      await loadReviews();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar tu reseña.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6" aria-label={`Reseñas de ${locationName}`}>
      <header className="rounded-2xl border border-border bg-white p-5">
        <h3 className="text-lg font-bold text-gray-900">Calificaciones y reseñas</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {reviews.length ? average.toFixed(1) : "—"}
          </span>
          <span className="flex text-amber-400" aria-label={`${average.toFixed(1)} de 5 estrellas`}>
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${index < Math.round(average) ? "fill-amber-400" : ""}`}
              />
            ))}
          </span>
          <span className="text-sm text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
          </span>
        </div>
      </header>

      {user?.role === "comensal" && (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-white p-5">
          <h4 className="font-semibold text-gray-900">
            {editing
              ? "Editar mi comentario"
              : currentReview
                ? "Actualizar mi calificación"
                : "Califica tu experiencia"}
          </h4>
          {!editing && (
            <div className="flex gap-1" role="group" aria-label="Selecciona una calificación">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
                    aria-pressed={rating === value}
                    className="rounded p-1 text-amber-400"
                  >
                    <Star className={`h-6 w-6 ${value <= rating ? "fill-amber-400" : ""}`} />
                  </button>
                );
              })}
            </div>
          )}
          <label className="block text-sm text-gray-700" htmlFor="restaurant-review-comment">
            Comentario{" "}
            <span className="text-muted-foreground">
              (opcional salvo calificaciones menores a 3)
            </span>
          </label>
          <textarea
            id="restaurant-review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            minLength={10}
            maxLength={500}
            rows={4}
            placeholder="Cuéntale a otras personas cómo fue tu experiencia"
            className="w-full resize-y rounded-xl border border-border p-3 text-sm outline-none focus:border-primary"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{comment.length}/500</span>
            <div className="flex gap-2">
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setComment("");
                  }}
                  className="rounded-xl px-3 py-2 text-sm text-muted-foreground"
                >
                  Cancelar
                </button>
              )}
              <PrimaryButton type="submit" size="md" disabled={saving}>
                {saving
                  ? "Guardando…"
                  : editing
                    ? "Guardar cambios"
                    : currentReview
                      ? "Actualizar reseña"
                      : "Publicar reseña"}
              </PrimaryButton>
            </div>
          </div>
        </form>
      )}
      {!user && (
        <p className="rounded-xl bg-gray-50 p-4 text-sm text-muted-foreground">
          Inicia sesión como comensal para calificar este restaurante.
        </p>
      )}

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
          {!loading && (
            <button type="button" onClick={loadReviews} className="ml-2 font-semibold underline">
              Reintentar
            </button>
          )}
        </div>
      )}
      {loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Cargando reseñas…</p>
      ) : reviews.length === 0 ? (
        <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-muted-foreground">
          Aún no hay reseñas para este restaurante.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div
                  className="flex items-center gap-1 text-amber-400"
                  aria-label={`${review.rating} de 5 estrellas`}
                >
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${index < review.rating ? "fill-amber-400" : ""}`}
                    />
                  ))}
                </div>
                <time className="text-xs text-muted-foreground" dateTime={review.createdAt}>
                  {new Date(review.editedAt ?? review.createdAt).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {review.editedAt ? " · Editada" : ""}
                </time>
              </div>
              {review.comment && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {review.comment}
                </p>
              )}
              {review.userId === user?.id && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setComment(review.comment ?? "");
                    setRating(review.rating);
                  }}
                  className="mt-3 text-sm font-semibold text-primary"
                >
                  Editar mi comentario
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function Restaurant() {
  return <RestaurantContent />;
}
