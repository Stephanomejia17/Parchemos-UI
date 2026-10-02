"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Loader2,
  BookmarkPlus,
  Heart,
  MapPin,
  MessageSquare,
  Play,
  Search,
  Share2,
} from "lucide-react";
import { BrandLogo, PrimaryButton, StarRating } from "@/shared/components";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { CATEGORIES } from "@/mocks/customer/home";
import { restaurantService } from "@/shared/services/restaurant/restaurant.service";

type FeedPost = {
  id: string;
  locationId: string;
  type: "photo";
  restaurant: string;
  location: string;
  rating: number;
  ratingCount: number;
  price: string;
  img: string;
  caption: string;
  likes: number;
  comments: number;
  tags: string[];
  user: { name: string; avatar: string };
  saved: boolean;
  liked: boolean;
};

const CATEGORY_SLUGS: Record<string, string> = {
  Postres: "postres",
  Colombiana: "colombiana",
  Parrilla: "parrilla",
  "\u00C1si\u00E1tica": "asiatica",
  Italiana: "italiana",
  "Caf\u00E9": "cafe",
  Mexicana: "mexicana",
  Mariscos: "mariscos",
  Pizza: "pizza",
  Hamburguesas: "hamburguesas",
  Japonesa: "japonesa",
  Vegetariana: "vegetariana",
};

const PRICE_OPTIONS = [
  { label: "Econ\u00F3mico", value: 1 },
  { label: "Medio", value: 2 },
  { label: "Alto", value: 3 },
  { label: "Muy alto", value: 4 },
];

export function Home() {
  const router = useRouter();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<number[]>([]);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedPrices, setAppliedPrices] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("");
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const locations = await restaurantService.listPublicLocations({
          nombre: searchTerm.trim() || undefined,
          categoria:
            appliedCategories.length > 0
              ? appliedCategories.join(",")
              : undefined,
          precio:
            appliedPrices.length > 0
              ? appliedPrices.join(",")
              : undefined,
          ordenar_por: sortBy || undefined,
        });

        if (!locations.length) {
          setPosts([]);
          setNoResults(true);
          return;
        }

        setNoResults(false);

        const realPosts = locations.map((location) => {
          const image = location.coverUrl ?? location.logoUrl ?? location.images[0]?.url ?? "";
          return {
            id: location.id,
            locationId: location.id,
            type: "photo" as const,
            restaurant: location.restaurant?.businessName ?? location.name,
            location: location.address,
            rating: location.avgRating,
            ratingCount: location.ratingCount,
            price: location.priceRange != null ? "$".repeat(location.priceRange) : "Precio por consultar",
            img: image,
            caption: location.description ?? "Descubre esta sede en Parchemos.",
            likes: 0,
            comments: location.ratingCount,
            tags: [],
            user: { name: location.restaurant?.businessName ?? location.name, avatar: image },
            saved: false,
            liked: false,
          };
        });

        setPosts(realPosts);
        setLoading(false);
      } catch (error) {
        console.error("No se pudieron cargar los restaurantes públicos:", error);
        setPosts([]);
        setNoResults(true);
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [searchTerm, appliedCategories, appliedPrices, sortBy]);

  const goRestaurant = (locationId?: string) => {
    if (locationId) {
      router.push(`/restaurant?locationId=${encodeURIComponent(locationId)}`);
      return;
    }

    router.push("/restaurant");
  };

  const goMenu = (locationId?: string) => router.push(locationId ? `/menu?locationId=${encodeURIComponent(locationId)}` : "/menu");

  const toggleCategory = (label: string) => {
    const slug = CATEGORY_SLUGS[label];

    if (!slug) {
      return;
    }

    setSelectedCategories((current) =>
      current.includes(slug)
        ? current.filter((category) => category !== slug)
        : [...current, slug],
    );
  };

  const togglePrice = (price: number) => {
    setSelectedPrices((current) =>
      current.includes(price)
        ? current.filter((value) => value !== price)
        : [price],
    );
  };

  const applyFilters = () => {
    setAppliedCategories(selectedCategories);
    setAppliedPrices(selectedPrices);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPrices([]);
    setAppliedCategories([]);
    setAppliedPrices([]);
    setSortBy("");
  };

  const toggleLike = (id: string) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );

  const toggleSave = (id: string) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, saved: !p.saved } : p,
      ),
    );

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      {/* Barra superior m\u00F3vil; en escritorio se usa el encabezado lateral */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border px-4 pt-4 pb-3 md:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-8 w-8 rounded-xl" />

            <span className="text-xl font-extrabold text-gray-900 font-heading">
              Parchemos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-2xl bg-gray-100">
              <Bell className="w-4 h-4 text-gray-700" />
            </button>

            <button className="w-9 h-9 flex items-center justify-center rounded-2xl bg-gray-100">
              <Search className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop header row */}
      <div className="hidden md:flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">
            Inicio
          </h2>

          <p className="text-sm text-muted-foreground mt-0.5">
            Bogotá, Colombia · Descubriendo cerca de ti
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-2xl border border-border px-4 py-2.5 w-72">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />

          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="bg-transparent text-sm outline-none flex-1 placeholder-muted-foreground"
            placeholder="Buscar restaurantes..."
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b border-border md:border-b-0 md:bg-transparent">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-3 md:px-6">
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleCategory(cat.label)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-semibold flex-shrink-0 transition-all ${
                selectedCategories.includes(CATEGORY_SLUGS[cat.label])
                  ? "bg-primary text-white shadow-sm shadow-orange-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
            Ordenar:
          </span>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="px-3 py-1.5 rounded-2xl border border-border text-xs font-semibold text-gray-700 bg-white flex-shrink-0 outline-none"
          >
            <option value="">Más recientes</option>
            <option value="calificacion">Más calificados</option>
            <option value="precio">Menor precio</option>
          </select>

          <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
            Precio:
          </span>

          <select
            value={selectedPrices[0] ?? ""}
            onChange={(event) => {
              const value = Number(event.target.value);

              setSelectedPrices(
                value ? [value] : [],
              );
            }}
            className="px-3 py-1.5 rounded-2xl border border-border text-xs font-semibold text-gray-700 bg-white flex-shrink-0 outline-none"
          >
            <option value="">Más recientes</option>

            {PRICE_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={applyFilters}
            className="px-4 py-1.5 rounded-2xl bg-primary text-white text-xs font-semibold flex-shrink-0"
          >
            Aplicar filtros
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-1.5 rounded-2xl border border-border text-gray-700 text-xs font-semibold flex-shrink-0"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="px-0 md:px-6 md:py-4">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Cargando restaurantes" /></div>
        ) : noResults ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <p className="text-base font-semibold text-gray-900">
              No encontramos restaurantes
            </p>

            <p className="text-sm text-muted-foreground mt-2">
              No hay restaurantes que coincidan con los filtros o la
              b\u00FAsqueda. Intenta modificar los criterios.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 md:gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border-b border-border md:rounded-2xl md:border md:shadow-sm overflow-hidden"
              >
                <div className="relative">
                  <RemoteImage
                    src={post.img}
                    alt={post.restaurant}
                    className="w-full h-72 md:h-64"
                  />

                  <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all ${
                        post.liked ? "scale-110" : ""
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          post.liked
                            ? "fill-red-500 text-red-500"
                            : "text-gray-700"
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => toggleSave(post.id)}
                      className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
                    >
                      <BookmarkPlus
                        className={`w-5 h-5 transition-colors ${
                          post.saved
                            ? "fill-primary text-primary"
                            : "text-gray-700"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="px-4 pt-4 pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button type="button" onClick={() => goRestaurant(post.locationId)} className="text-left text-2xl font-extrabold leading-tight text-gray-900 hover:text-primary">
                        {post.restaurant}
                      </button>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {post.location}
                      </p>
                    </div>
                    <StarRating rating={post.rating} />
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-1.5"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          post.liked
                            ? "fill-red-500 text-red-500"
                            : "text-gray-700"
                        }`}
                      />

                      <span className="text-sm font-semibold text-gray-700">
                        {post.likes.toLocaleString()}
                      </span>
                    </button>

                    <button className="flex items-center gap-1.5">
                      <MessageSquare className="w-5 h-5 text-gray-700" />

                      <span className="text-sm font-semibold text-gray-700">
                        {post.comments}
                      </span>
                    </button>

                    <button className="flex items-center gap-1.5">
                      <Share2 className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-800 leading-relaxed">
                    <span className="font-semibold">{post.user.name}</span>{" "}
                    {post.caption}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-primary font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <PrimaryButton onClick={() => goMenu(post.locationId)} size="sm" className="w-full">
                    Ver menú de la sede
                  </PrimaryButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




