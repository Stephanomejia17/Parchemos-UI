"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BookmarkPlus, Heart, MapPin, MessageSquare, Play, Search, Share2 } from "lucide-react";
import { PrimaryButton, StarRating } from "@parchemos/shared/components";
import { RemoteImage } from "@/components/media/RemoteImage";
import { CATEGORIES, FEED_POSTS, STORIES } from "./data";

export function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState(FEED_POSTS);
  const [activeCategory, setActiveCategory] = useState(0);

  const goRestaurant = () => router.push("/restaurant");
  const goMenu = () => router.push("/menu");

  const toggleLike = (id: number) =>
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p)));
  const toggleSave = (id: number) => setPosts(prev => prev.map(p => (p.id === id ? { ...p, saved: !p.saved } : p)));

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      {/* Top bar — mobile only (desktop uses sidebar header) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border px-4 pt-4 pb-3 md:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-base">🍽️</span>
            </div>
            <span className="text-xl font-extrabold text-gray-900 font-heading">Parchemos</span>
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
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Inicio</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Bogotá, Colombia · Descubriendo cerca tuyo</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-border px-4 py-2.5 w-72">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input className="bg-transparent text-sm outline-none flex-1 placeholder-muted-foreground" placeholder="Buscar restaurantes..." />
        </div>
      </div>

      {/* Stories */}
      <div className="bg-white border-b border-border md:border-b-0 md:bg-transparent">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-3 md:px-6">
          {STORIES.map(s => (
            <div key={s.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={`p-0.5 rounded-full ${s.hasNew ? "bg-gradient-to-tr from-primary to-secondary" : "bg-gray-200"}`}>
                <div className="w-14 h-14 rounded-full bg-white p-0.5">
                  <RemoteImage src={s.img} alt={s.name} className="w-full h-full rounded-full" sizes="56px" />
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium max-w-[56px] truncate">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b border-border md:border-b-0 md:bg-transparent">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-3 md:px-6">
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-semibold flex-shrink-0 transition-all ${
                activeCategory === i ? "bg-primary text-white shadow-sm shadow-orange-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed — single col mobile, 2-col md, 3-col xl */}
      <div className="px-0 md:px-6 md:py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 md:gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white border-b border-border md:rounded-2xl md:border md:shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <RemoteImage src={post.user.avatar} alt={post.user.name} className="w-9 h-9 rounded-full" sizes="36px" />
                  <div>
                    <button onClick={goRestaurant} className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors">
                      {post.restaurant}
                    </button>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{post.location}</span>
                      <span className="text-xs text-muted-foreground mx-1">·</span>
                      <span className="text-xs font-medium text-gray-700">{post.price}</span>
                    </div>
                  </div>
                </div>
                <StarRating rating={post.rating} />
              </div>
              <div className="relative">
                <RemoteImage src={post.img} alt={post.restaurant} className="w-full h-72 md:h-64" />
                {post.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all ${post.liked ? "scale-110" : ""}`}
                  >
                    <Heart className={`w-5 h-5 transition-colors ${post.liked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                  </button>
                  <button
                    onClick={() => toggleSave(post.id)}
                    className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
                  >
                    <BookmarkPlus className={`w-5 h-5 transition-colors ${post.saved ? "fill-primary text-primary" : "text-gray-700"}`} />
                  </button>
                </div>
              </div>
              <div className="px-4 pt-3 pb-1">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5">
                    <Heart className={`w-5 h-5 ${post.liked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                    <span className="text-sm font-semibold text-gray-700">{post.likes.toLocaleString()}</span>
                  </button>
                  <button className="flex items-center gap-1.5">
                    <MessageSquare className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-semibold text-gray-700">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1.5">
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  <span className="font-semibold">{post.user.name}</span> {post.caption}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs text-primary font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3 flex gap-2">
                <PrimaryButton onClick={() => {}} size="sm" className="flex-1">
                  📅 Reservar
                </PrimaryButton>
                <PrimaryButton onClick={goMenu} size="sm" variant="outline" className="flex-1">
                  🍴 Ver menú
                </PrimaryButton>
                <PrimaryButton onClick={goMenu} size="sm" variant="ghost" className="flex-1">
                  🛍️ Pedir
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
