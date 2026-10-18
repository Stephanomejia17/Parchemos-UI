"use client";

import Link from "next/link";
import { Grid3x3, Heart, MapPin, Pencil, Plus, SlidersHorizontal, UserRound } from "lucide-react";

export type ProfileTab = "posts" | "edit";

/** Cabecera del perfil estilo red social: foto, nombre, contador y acciones. */
export function ProfileHero({
  fullName,
  city,
  photoUrl,
  postsTotal,
  tab,
  onTabChange,
  publishHref,
  preferencesHref,
  favoritesHref,
}: {
  fullName: string;
  city: string | null;
  photoUrl: string | null;
  postsTotal: number | null;
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  publishHref: string;
  /** Solo comensales: sus gustos alimentan las recomendaciones. */
  preferencesHref?: string;
  /** Solo comensales: su lista de restaurantes favoritos. */
  favoritesHref?: string;
}) {
  const tabs: { id: ProfileTab; label: string; icon: typeof Grid3x3 }[] = [
    { id: "posts", label: "Publicaciones", icon: Grid3x3 },
    { id: "edit", label: "Editar perfil", icon: Pencil },
  ];

  return (
    <header className="mb-4">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-4 ring-white">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
          ) : (
            <UserRound className="h-10 w-10 text-gray-400" />
          )}
        </div>
        <h1 className="mt-3 font-heading text-xl font-bold text-gray-900">{fullName}</h1>
        {city && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {city}
          </p>
        )}
        <p className="mt-3 text-sm text-gray-600">
          <span className="text-lg font-bold text-gray-900">{postsTotal ?? "–"}</span>{" "}
          {postsTotal === 1 ? "publicación" : "publicaciones"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Link
          href={publishHref}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Publicar
        </Link>
        {favoritesHref && (
          <Link
            href={favoritesHref}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
          >
            <Heart className="h-4 w-4" />
            Mis favoritos
          </Link>
        )}
        {preferencesHref && (
          <Link
            href={preferencesHref}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Mis gustos
          </Link>
        )}
      </div>

      <div role="tablist" className="mt-5 grid grid-cols-2 border-b border-border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => onTabChange(id)}
            className={`flex items-center justify-center gap-1.5 border-b-2 py-3 text-sm font-semibold transition-colors ${
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-gray-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
