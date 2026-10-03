"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, Loader2, Star, UserRound } from "lucide-react";
import { useAuth } from "@/shared/auth/auth-context";
import { PrimaryButton } from "@/shared/components";
import { restaurantService, type LocationReview } from "@/shared/services/restaurant/restaurant.service";

type ReviewsProps = {
  locationId: string;
  locationName: string;
};

export function Reviews({ locationId, locationName }: ReviewsProps) {
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
  const distribution = useMemo(
    () => [5, 4, 3, 2, 1].map((value) => reviews.filter((review) => review.rating === value).length),
    [reviews],
  );

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
    setLoading(true);
    setError(null);
    restaurantService
      .listLocationReviews(locationId)
      .then((data) => {
        if (active) setReviews(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "No se pudieron cargar las reseñas.");
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
      setError("Para una calificación menor a 3 estrellas, escribe un comentario de al menos 10 caracteres.");
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
        await restaurantService.createLocationReview(locationId, rating, normalizedComment || undefined);
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

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl animate-pulse space-y-6" aria-label="Cargando reseñas">
        <div className="grid gap-4 md:grid-cols-2"><div className="h-52 rounded-3xl bg-muted" /><div className="h-52 rounded-3xl bg-muted" /></div>
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="space-y-3"><div className="h-24 rounded-2xl bg-muted" /><div className="h-24 rounded-2xl bg-muted" /></div>
      </section>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-border bg-surface p-8 text-center" role="alert">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <p className="mt-3 font-semibold text-foreground">No pudimos cargar las reseñas</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <button type="button" onClick={loadReviews} className="mt-5 min-h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground transition duration-200 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary">Reintentar</button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-7" aria-label={`Reseñas de ${locationName}`}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <div className="rounded-3xl border border-border bg-surface p-5 md:p-7">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Calificación general</p>
              <p className="mt-2 text-5xl font-bold text-primary">{reviews.length ? average.toFixed(1) : "—"}</p>
              <div className="mt-2 flex gap-1 text-primary" aria-label={`${average.toFixed(1)} de 5 estrellas`}>
                {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-5 w-5 ${index < Math.round(average) ? "fill-primary" : ""}`} />)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}</p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              {distribution.map((count, index) => {
                const stars = 5 - index;
                const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
                return <div key={stars} className="flex items-center gap-2 text-xs text-muted-foreground"><span className="w-3">{stars}</span><Star className="h-3 w-3 fill-primary text-primary" /><span className="h-2 flex-1 overflow-hidden rounded-full bg-primary-soft"><span className="block h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} /></span><span className="w-5 text-right">{count}</span></div>;
              })}
            </div>
          </div>
        </div>

        {user?.role === "comensal" ? (
          <form onSubmit={submit} className="rounded-3xl border border-border bg-surface p-5 md:p-7">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-sm font-semibold text-muted-foreground">Tu opinión</p><h3 className="mt-1 text-xl font-bold text-foreground">{editing ? "Edita tu reseña" : currentReview ? "Actualiza tu reseña" : "Añade una reseña"}</h3></div>
              {saving && <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Guardando reseña" />}
            </div>
            <div className="mt-5 flex gap-1" role="group" aria-label="Selecciona una calificación">
              {Array.from({ length: 5 }, (_, index) => { const value = index + 1; return <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`} aria-pressed={rating === value} className="rounded-full p-1 text-primary transition duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary"><Star className={`h-6 w-6 ${value <= rating ? "fill-primary" : ""}`} /></button>; })}
            </div>
            <label htmlFor="restaurant-review-comment" className="mt-4 block text-xs font-semibold text-muted-foreground">Escribe tu experiencia</label>
            <textarea id="restaurant-review-comment" value={comment} onChange={(event) => setComment(event.target.value)} minLength={10} maxLength={500} rows={3} placeholder="Cuéntale a otras personas cómo fue tu experiencia" className="mt-2 w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm text-foreground outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20" />
            <div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{comment.length}/500</span><div className="flex gap-2">{editing && <button type="button" onClick={() => { setEditing(false); setComment(""); }} className="min-h-11 rounded-full px-4 text-sm font-semibold text-muted-foreground">Cancelar</button>}<PrimaryButton type="submit" size="md" disabled={saving}>{saving ? "Guardando..." : editing ? "Guardar cambios" : currentReview ? "Actualizar" : "Publicar"}</PrimaryButton></div></div>
          </form>
        ) : (
          <div className="flex items-center rounded-3xl border border-border bg-primary-soft p-6 text-sm text-muted-foreground">Inicia sesión como comensal para calificar este restaurante.</div>
        )}
      </div>

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/20 bg-surface p-4 text-sm text-destructive"><span>{error}</span><button type="button" onClick={loadReviews} className="font-semibold underline">Reintentar</button></div>}

      <div>
        <div className="mb-4 flex items-center gap-3"><h3 className="text-lg font-bold text-foreground">Reseñas recientes</h3><span className="h-px flex-1 bg-border" /></div>
        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center"><UserRound className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-semibold text-foreground">Aún no hay reseñas</p><p className="mt-1 text-sm text-muted-foreground">Sé la primera persona en compartir su experiencia.</p></div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {reviews.map((review) => <article key={review.id} className="rounded-2xl border border-border bg-surface p-4 transition duration-200 hover:shadow-sm"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><UserRound className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div className="flex gap-0.5 text-primary" aria-label={`${review.rating} de 5 estrellas`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-3.5 w-3.5 ${index < review.rating ? "fill-primary" : ""}`} />)}</div><time className="text-xs text-muted-foreground" dateTime={review.createdAt}>{new Date(review.editedAt ?? review.createdAt).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{review.comment || "Sin comentario."}</p>{review.editedAt && <p className="mt-2 text-xs text-muted-foreground">Editada</p>}{review.userId === user?.id && <button type="button" onClick={() => { setEditing(true); setComment(review.comment ?? ""); setRating(review.rating); }} className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary"><Check className="h-4 w-4" />Editar mi reseña</button>}</div></div></article>)}
          </div>
        )}
      </div>
    </section>
  );
}
