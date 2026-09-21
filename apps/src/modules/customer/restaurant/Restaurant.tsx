"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
BookmarkPlus,
ChevronLeft,
MapPin,
Plus,
Share2,
Star,
} from "lucide-react";
import { CustomerBadge as Badge, PrimaryButton } from "@/shared/components";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { MENU_SECTIONS } from "@/mocks/customer/menu";
import {
restaurantService,
type LocationReview,
} from "@/shared/services/restaurant/restaurant.service";
import type { Location } from "@/shared/types/restaurant";

const TABS = ["Menú", "Fotos", "Reseñas", "Eventos"];

const GALLERY = [
"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&auto=format",
"https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200&h=200&fit=crop&auto=format",
"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop&auto=format",
"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop&auto=format",
"https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop&auto=format",
"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop&auto=format",
];

export function Restaurant() {
const router = useRouter();
const searchParams = useSearchParams();

const locationId = searchParams.get("locationId");

const [restaurant, setRestaurant] = useState<Location | null>(null);
const [loadingRestaurant, setLoadingRestaurant] = useState(true);
const [restaurantError, setRestaurantError] = useState("");

const [reviews, setReviews] = useState<LocationReview[]>([]);
const [loadingReviews, setLoadingReviews] = useState(false);
const [reviewsError, setReviewsError] = useState("");

const [tab, setTab] = useState("menú");
const [rating, setRating] = useState(0);
const [ratingError, setRatingError] = useState("");
const [comment, setComment] = useState("");
const [commentError, setCommentError] = useState("");
const [showCommentForm, setShowCommentForm] = useState(false);
const [reviewSubmitted, setReviewSubmitted] = useState(false);

const [isEditingReview, setIsEditingReview] = useState(false);
const [editComment, setEditComment] = useState("");
const [editCommentError, setEditCommentError] = useState("");
const [reviewEdited, setReviewEdited] = useState(false);
const [currentReview, setCurrentReview] =
useState<LocationReview | null>(null);

useEffect(() => {
if (!locationId) {
setRestaurantError("No se encontró el restaurante seleccionado.");
setLoadingRestaurant(false);
return;
}

setLoadingRestaurant(true);
setRestaurantError("");

restaurantService
  .getPublicLocation(locationId)
  .then(setRestaurant)
  .catch((error) => {
    console.error("Error cargando el restaurante:", error);
    setRestaurantError("No fue posible cargar el restaurante.");
  })
  .finally(() => {
    setLoadingRestaurant(false);
  });

}, [locationId]);

useEffect(() => {
if (!locationId) {
return;
}

setLoadingReviews(true);
setReviewsError("");

restaurantService
  .listLocationReviews(locationId)
  .then((data) => {
    setReviews(data);
  })
  .catch((error) => {
    console.error("Error cargando las reseñas:", error);
    setReviewsError("No fue posible cargar las reseñas.");
  })
  .finally(() => {
    setLoadingReviews(false);
  });

}, [locationId]);

const goMenu = () => router.push("/menu");

const handleSendRating = async () => {
setRatingError("");
setCommentError("");

if (rating === 0) {
  setRatingError("Selecciona al menos una estrella para calificar.");
  return;
}

if (rating < 3) {
  setShowCommentForm(true);
  return;
}

if (!locationId) {
  setRatingError("No se encontró el restaurante seleccionado.");
  return;
}

try {
  const review = await restaurantService.createLocationReview(
    locationId,
    rating,
  );

  setCurrentReview(review);
  setReviewSubmitted(true);

  setReviews((current) => {
    const exists = current.some((item) => item.id === review.id);

    if (exists) {
      return current.map((item) =>
        item.id === review.id ? review : item,
      );
    }

    return [review, ...current];
  });

} catch (error) {
  console.error("Error enviando la calificación:", error);
  setRatingError("No fue posible enviar la calificación.");
}

};

const handlePublishComment = async () => {
setCommentError("");

const trimmedComment = comment.trim();

if (trimmedComment.length < 10) {
  setCommentError("El comentario debe tener al menos 10 caracteres.");
  return;
}

if (trimmedComment.length > 500) {
  setCommentError("El comentario no puede superar los 500 caracteres.");
  return;
}

if (!locationId) {
  setCommentError("No se encontró el restaurante seleccionado.");
  return;
}

if (rating === 0) {
  setCommentError("Selecciona una calificación.");
  return;
}

try {
  const review = await restaurantService.createLocationReview(
    locationId,
    rating,
    trimmedComment,
  );

  setCurrentReview(review);
  setComment(trimmedComment);
  setReviewSubmitted(true);
  setShowCommentForm(false);

  setReviews((current) => {
    const exists = current.some((item) => item.id === review.id);

    if (exists) {
      return current.map((item) =>
        item.id === review.id ? review : item,
      );
    }

    return [review, ...current];
  });

} catch (error) {
  console.error("Error publicando la reseña:", error);
  setCommentError("No fue posible publicar la reseña.");
}

};

const handleEditReview = () => {
if (!currentReview) {
return;
}

setEditComment(currentReview.comment ?? "");
setEditCommentError("");
setIsEditingReview(true);

};

const handleSaveEditedReview = async () => {
setEditCommentError("");

const trimmedComment = editComment.trim();

if (trimmedComment.length < 10) {
  setEditCommentError("El comentario debe tener al menos 10 caracteres.");
  return;
}

if (trimmedComment.length > 500) {
  setEditCommentError("El comentario no puede superar los 500 caracteres.");
  return;
}

if (!currentReview) {
  setEditCommentError("No se encontró tu reseña.");
  return;
}

try {
  const updatedReview = await restaurantService.updateLocationReview(
    currentReview.id,
    trimmedComment,
  );

  setCurrentReview(updatedReview);

  setReviews((current) =>
    current.map((review) =>
      review.id === updatedReview.id ? updatedReview : review,
    ),
  );

  setComment(trimmedComment);
  setReviewEdited(true);
  setIsEditingReview(false);
} catch (error) {
  console.error("Error editando la reseña:", error);
  setEditCommentError("No fue posible guardar los cambios.");
}

};

const handleCancelEdit = () => {
if (!currentReview) {
return;
}

setEditComment(currentReview.comment ?? "");
setEditCommentError("");
setIsEditingReview(false);

};

if (loadingRestaurant) {
return ( <div className="flex h-full items-center justify-center bg-background"> <p className="text-sm text-muted-foreground">
Cargando restaurante... </p> </div>
);
}

if (restaurantError || !restaurant) {
return ( <div className="flex h-full flex-col items-center justify-center gap-3 bg-background p-6 text-center"> <p className="font-semibold text-gray-900">
{restaurantError || "No se encontró el restaurante."} </p>

    <button
      onClick={() => router.back()}
      className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
    >
      Volver
    </button>
  </div>
);

}

const price = restaurant.priceRange
? "$".repeat(restaurant.priceRange)
: "Precio no disponible";

return ( <div className="flex flex-col h-full overflow-y-auto bg-background"> <div className="relative">
<RemoteImage
src={
restaurant.coverUrl ??
restaurant.logoUrl ??
"https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=500&fit=crop&auto=format"
}
alt={restaurant.name}
className="w-full h-56 md:h-72 lg:h-80"
sizes="100vw"
/>

    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

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

  <div className="bg-white px-4 pb-4 pt-4 border-b border-border md:px-6 md:pb-6">
    <div className="md:flex md:items-start md:justify-between md:gap-8">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3 md:block">
          <div>
            <h2 className="text-xl font-bold text-gray-900 md:text-2xl font-heading">
              {restaurant.name}
            </h2>

            <p className="text-sm text-muted-foreground mt-0.5">
              {price}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 md:hidden">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />

              <span className="font-bold text-gray-900">
                {(restaurant.avgRating ?? 0).toFixed(1)}
              </span>
            </div>

            <span className="text-xs text-muted-foreground">
              {restaurant.ratingCount} reseñas
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {restaurant.address}
          </div>

          <div className="flex items-center gap-1 text-xs text-accent font-semibold">
            <div className="w-2 h-2 rounded-full bg-accent" />
            Activo
          </div>

          <div className="hidden md:flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />

            <span className="font-semibold text-gray-900">
              {(restaurant.avgRating ?? 0).toFixed(1)}
            </span>

            <span className="text-muted-foreground">
              ({restaurant.ratingCount})
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {["Terraza", "Pet Friendly", "Wifi", "Reservas", "Parking"].map(
            (tag) => (
              <Badge key={tag} color="gray">
                {tag}
              </Badge>
            ),
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 md:mt-0 md:flex-shrink-0 md:w-64">
        <PrimaryButton size="md" className="w-full">
          📅 Reservar
        </PrimaryButton>

        <PrimaryButton
          size="md"
          variant="outline"
          className="w-full"
          onClick={goMenu}
        >
          🍴 Ver menú
        </PrimaryButton>

        <PrimaryButton
          size="md"
          variant="secondary"
          className="w-full"
          onClick={goMenu}
        >
          🛍️ Pedir ahora
        </PrimaryButton>

        <PrimaryButton
          size="md"
          variant="ghost"
          className="w-full border border-gray-200"
        >
          🪑 Ir a la mesa
        </PrimaryButton>
      </div>
    </div>
  </div>

  <div className="bg-white border-b border-border sticky top-0 z-10">
    <div className="flex px-4 md:px-6">
      {TABS.map((t) => (
        <button
          key={t}
          onClick={() => setTab(t.toLowerCase())}
          className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
            tab === t.toLowerCase()
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  </div>

  <div className="p-4 md:p-6">
    {tab === "menú" && (
      <>
        <h3 className="font-bold text-gray-900 mb-3">Más pedidos</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MENU_SECTIONS[0].items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 bg-white rounded-2xl p-3 border border-border shadow-sm"
            >
              <RemoteImage
                src={item.img}
                alt={item.name}
                className="w-20 h-20 rounded-xl flex-shrink-0"
                sizes="80px"
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">
                  {item.name}
                </p>

                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {item.desc}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary text-sm">
                    ${item.price.toLocaleString()}
                  </span>

                  <button
                    onClick={goMenu}
                    className="w-7 h-7 bg-primary rounded-xl flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )}

    {tab === "fotos" && (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {GALLERY.map((src, i) => (
          <RemoteImage
            key={i}
            src={src}
            alt="food"
            className="w-full h-40 md:h-48 rounded-xl"
            sizes="300px"
          />
        ))}
      </div>
    )}

    {tab === "reseñas" && (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <Star className="w-7 h-7 fill-yellow-400 text-yellow-400" />

            <div>
              <p className="text-2xl font-bold text-gray-900">
                {(restaurant.avgRating ?? 0).toFixed(1)}
              </p>

              <p className="text-sm text-muted-foreground">
                {restaurant.ratingCount} reseñas
              </p>
            </div>
          </div>
        </div>

        {!reviewSubmitted && (
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-bold text-gray-900 text-lg">
              Califica este restaurante
            </h3>

            <p className="text-sm text-muted-foreground mt-1">
              Selecciona de 1 a 5 estrellas.
            </p>

            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setRating(value);
                    setRatingError("");
                  }}
                  aria-label={`${value} estrellas`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      value <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {ratingError && (
              <p className="text-sm text-red-600 mt-2">
                {ratingError}
              </p>
            )}

            <button
              type="button"
              onClick={handleSendRating}
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
            >
              Enviar
            </button>

            {showCommentForm && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-bold text-gray-900">
                  Cuéntanos tu experiencia
                </h4>

                <p className="text-sm text-muted-foreground mt-1">
                  Como tu calificación es menor a 3 estrellas, cuéntanos
                  qué ocurrió.
                </p>

                <textarea
                  value={comment}
                  onChange={(event) => {
                    setComment(event.target.value);
                    setCommentError("");
                  }}
                  maxLength={501}
                  placeholder="Escribe tu experiencia..."
                  className="w-full min-h-32 mt-4 rounded-xl border border-border p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20"
                />

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {comment.length} / 500
                  </span>

                  {comment.length > 500 && (
                    <span className="text-xs text-red-600">
                      Excediste el límite
                    </span>
                  )}
                </div>

                {commentError && (
                  <p className="text-sm text-red-600 mt-2">
                    {commentError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handlePublishComment}
                  disabled={comment.length > 500}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publicar
                </button>
              </div>
            )}
          </div>
        )}

        {reviewSubmitted && currentReview && (
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-gray-900">Tu reseña</h3>

              {!isEditingReview && (
                <button
                  type="button"
                  onClick={handleEditReview}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Editar
                </button>
              )}
            </div>

            {!isEditingReview ? (
              <>
                <div className="flex items-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`w-5 h-5 ${
                        value <= currentReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {currentReview.comment && (
                  <p className="text-sm text-gray-700 mt-3">
                    {currentReview.comment}
                  </p>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  {reviewEdited
                    ? "Editada recientemente"
                    : "Publicada recientemente"}
                </p>
              </>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Modifica tu comentario.
                </p>

                <textarea
                  value={editComment}
                  onChange={(event) => {
                    setEditComment(event.target.value);
                    setEditCommentError("");
                  }}
                  maxLength={501}
                  className="w-full min-h-32 mt-4 rounded-xl border border-border p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20"
                />

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {editComment.length} / 500
                  </span>

                  {editComment.length > 500 && (
                    <span className="text-xs text-red-600">
                      Excediste el límite
                    </span>
                  )}
                </div>

                {editCommentError && (
                  <p className="text-sm text-red-600 mt-2">
                    {editCommentError}
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleSaveEditedReview}
                    disabled={editComment.length > 500}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Guardar cambios
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 rounded-xl border border-border text-gray-700 text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="font-bold text-gray-900 mb-3">
            Reseñas de otros usuarios
          </h3>

          {loadingReviews ? (
            <p className="text-sm text-muted-foreground">
              Cargando reseñas...
            </p>
          ) : reviewsError ? (
            <p className="text-sm text-red-600">{reviewsError}</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay reseñas publicadas.
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-sm text-gray-900">
                      Usuario
                    </p>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={`w-4 h-4 ${
                            value <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-sm text-gray-700 mt-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {tab === "eventos" && (
      <div className="bg-white rounded-2xl border border-border p-6 text-center">
        <h3 className="font-bold text-gray-900">Eventos</h3>

        <p className="text-sm text-muted-foreground mt-1">
          Próximamente podrás consultar los eventos de este restaurante.
        </p>
      </div>
    )}
   </div>
  </div>
  );
}