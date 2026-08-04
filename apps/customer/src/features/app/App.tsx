import { useState, useEffect } from "react";
import {
  Home, Compass, CalendarCheck, ShoppingBag, User,
  Search, Star, MapPin, Heart, BookmarkPlus, Play,
  ChevronRight, Clock, Users, Flame,
  Plus, Minus, X, Check, QrCode, CreditCard,
  TrendingUp, ArrowUp, ArrowDown, MessageSquare, Share2,
  Bell, Settings, Award, Camera, Filter, Navigation,
  ChevronLeft, Utensils, ChefHat, BarChart3, DollarSign, Calendar,
  Eye, Send, LogOut, Edit3, Menu as MenuIcon,
} from "lucide-react";
import { CustomerBadge as Badge, PrimaryButton, StarRating } from "@parchemos/shared/components";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "splash" | "login" | "home" | "discover" | "reservations"
  | "orders" | "profile" | "restaurant" | "menu" | "order-summary"
  | "payment" | "admin-dashboard";

type Tab = "home" | "discover" | "reservations" | "orders" | "profile";

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: "🍔", label: "Burgers" }, { icon: "🍕", label: "Pizza" },
  { icon: "☕", label: "Café" }, { icon: "🍣", label: "Sushi" },
  { icon: "🥩", label: "Carnes" }, { icon: "🍜", label: "Asiático" },
  { icon: "🥐", label: "Bakery" }, { icon: "🍹", label: "Cócteles" },
];

const STORIES = [
  { id: 1, name: "La Paloma", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=80&h=80&fit=crop&auto=format", hasNew: true },
  { id: 2, name: "Castillo", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&h=80&fit=crop&auto=format", hasNew: true },
  { id: 3, name: "El Origen", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=80&h=80&fit=crop&auto=format", hasNew: false },
  { id: 4, name: "Noma Bogotá", img: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=80&h=80&fit=crop&auto=format", hasNew: true },
  { id: 5, name: "La Ventana", img: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=80&h=80&fit=crop&auto=format", hasNew: false },
  { id: 6, name: "Sur & Mar", img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=80&h=80&fit=crop&auto=format", hasNew: true },
];

const FEED_POSTS = [
  {
    id: 1, type: "video",
    restaurant: "La Paloma Gastrobar", location: "Zona Rosa, Bogotá",
    rating: 4.9, ratingCount: 2341,
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=700&fit=crop&auto=format",
    caption: "Nuestra new smash burger con queso ahumado, bacon crocante y salsa secreta. ¡La mejor de Bogotá! 🔥",
    likes: 4821, comments: 312,
    tags: ["#SmashBurger", "#LaZonaRosa", "#Bogotá"],
    user: { name: "La Paloma Oficial", avatar: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=40&h=40&fit=crop&auto=format" },
    price: "$$", saved: false, liked: false,
  },
  {
    id: 2, type: "photo",
    restaurant: "Castillo de Sal", location: "Usaquén, Bogotá",
    rating: 4.8, ratingCount: 1876,
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=700&fit=crop&auto=format",
    caption: "El ambiente perfecto para una noche especial. Reservas disponibles este fin de semana 🕯️",
    likes: 3290, comments: 198,
    tags: ["#Usaquén", "#CenaRomántica", "#Ambiente"],
    user: { name: "Castillo de Sal", avatar: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=40&h=40&fit=crop&auto=format" },
    price: "$$$", saved: true, liked: true,
  },
  {
    id: 3, type: "photo",
    restaurant: "El Origen", location: "Chapinero, Bogotá",
    rating: 4.7, ratingCount: 982,
    img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=700&fit=crop&auto=format",
    caption: "Bowl de proteínas con quinoa, aguacate y vinagreta de maracuyá. Saludable y delicioso 🥗",
    likes: 2105, comments: 87,
    tags: ["#Saludable", "#BowlLovers", "#Chapinero"],
    user: { name: "El Origen", avatar: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=40&h=40&fit=crop&auto=format" },
    price: "$$", saved: false, liked: false,
  },
];

const RESTAURANTS_MAP = [
  { id: 1, name: "La Paloma Gastrobar", category: "Burgers", rating: 4.9, price: "$$", distance: "0.3 km", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=300&h=200&fit=crop&auto=format", open: true, tags: ["Terraza", "Pet Friendly"], lat: 45, lng: 52 },
  { id: 2, name: "Castillo de Sal", category: "Mariscos", rating: 4.8, price: "$$$", distance: "0.7 km", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop&auto=format", open: true, tags: ["Parejas", "Reservas"], lat: 58, lng: 38 },
  { id: 3, name: "El Origen", category: "Saludable", rating: 4.7, price: "$$", distance: "1.1 km", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop&auto=format", open: false, tags: ["Vegan", "Sin Gluten"], lat: 35, lng: 65 },
  { id: 4, name: "Noma Bogotá", category: "Fusión", rating: 4.9, price: "$$$$", distance: "1.8 km", img: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=300&h=200&fit=crop&auto=format", open: true, tags: ["Fine Dining", "Parejas"], lat: 70, lng: 25 },
  { id: 5, name: "Sur & Mar", category: "Mariscos", rating: 4.6, price: "$$$", distance: "2.3 km", img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=300&h=200&fit=crop&auto=format", open: true, tags: ["Grupos", "Terraza"], lat: 25, lng: 72 },
];

const MENU_SECTIONS = [
  {
    title: "Más Pedidos", items: [
      { id: 1, name: "Smash Burger Clásica", desc: "Carne angus, queso cheddar, lechuga, tomate y salsa especial", price: 28500, time: "12 min", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&auto=format", calories: 680, popular: true },
      { id: 2, name: "Double Smash BBQ", desc: "Doble carne, bacon, queso gouda ahumado y salsa BBQ artesanal", price: 36500, time: "15 min", img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200&h=200&fit=crop&auto=format", calories: 920, popular: true },
    ],
  },
  {
    title: "Entradas", items: [
      { id: 3, name: "Papas Smash Cargadas", desc: "Papas aplastadas crujientes con queso, bacon y crema ácida", price: 18500, time: "8 min", img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop&auto=format", calories: 420, popular: false },
      { id: 4, name: "Aros de Cebolla", desc: "Aros rebozados con salsa de mostaza y miel", price: 14500, time: "7 min", img: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=200&h=200&fit=crop&auto=format", calories: 380, popular: false },
    ],
  },
  {
    title: "Bebidas", items: [
      { id: 5, name: "Milkshake Vainilla", desc: "Helado artesanal de vainilla con crema chantilly", price: 16500, time: "5 min", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop&auto=format", calories: 520, popular: false },
    ],
  },
];

const SALES_DATA = [
  { day: "Lun", ventas: 1240000, pedidos: 48 },
  { day: "Mar", ventas: 980000, pedidos: 37 },
  { day: "Mié", ventas: 1560000, pedidos: 61 },
  { day: "Jue", ventas: 1890000, pedidos: 72 },
  { day: "Vie", ventas: 2340000, pedidos: 94 },
  { day: "Sáb", ventas: 3120000, pedidos: 128 },
  { day: "Dom", ventas: 2780000, pedidos: 112 },
];

const RESERVATIONS_DATA = [
  { id: 1, restaurant: "La Paloma Gastrobar", date: "Sáb 3 Ago", time: "7:30 PM", guests: 2, status: "confirmed", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=80&h=80&fit=crop&auto=format" },
  { id: 2, restaurant: "Noma Bogotá", date: "Dom 4 Ago", time: "1:00 PM", guests: 4, status: "pending", img: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=80&h=80&fit=crop&auto=format" },
  { id: 3, restaurant: "Castillo de Sal", date: "Vie 9 Ago", time: "8:00 PM", guests: 2, status: "confirmed", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&h=80&fit=crop&auto=format" },
];

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-orange-200">
          <span className="text-5xl">🍽️</span>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>Parchemos</h1>
          <p className="text-muted-foreground text-sm mt-1">Descubre. Reserva. Disfruta.</p>
        </div>
      </div>
      <div className="absolute bottom-16 flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      {/* Hero image — full bg on mobile, left panel on desktop */}
      <div className="relative h-52 md:h-auto md:flex-1">
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=900&fit=crop&auto=format" alt="food" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-white md:bg-gradient-to-r md:from-transparent md:to-black/40" />
        {/* Logo overlay on desktop */}
        <div className="hidden md:flex absolute inset-0 items-end p-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🍽️</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>Parchemos</h1>
            </div>
            <p className="text-white/80 text-lg max-w-xs">La plataforma gastronómica que conecta personas con experiencias únicas.</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="bg-white px-6 pt-8 pb-12 flex flex-col gap-5 md:w-96 md:overflow-y-auto md:justify-center md:px-10 md:py-12 lg:w-[440px]">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-2 md:hidden">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
            <span className="text-xl">🍽️</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>Parchemos</h2>
        </div>
        {/* Desktop heading */}
        <div className="hidden md:block">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Bienvenido de vuelta</h2>
        </div>
        <p className="text-muted-foreground text-sm -mt-2 md:mt-0">La experiencia gastronómica que mereces</p>

        <button onClick={onLogin} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
          <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          Continuar con Google
        </button>
        <button onClick={onLogin} className="w-full flex items-center justify-center gap-3 bg-black rounded-2xl py-3.5 text-sm font-semibold text-white hover:bg-gray-900 transition-all">
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></svg>
          Continuar con Apple
        </button>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-muted-foreground">o</span><div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="flex flex-col gap-3">
          <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors" />
          <PrimaryButton onClick={onLogin} size="lg" className="w-full">Continuar</PrimaryButton>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Al continuar aceptas los <span className="text-primary font-semibold">Términos de servicio</span> y <span className="text-primary font-semibold">Política de privacidad</span>
        </p>
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ onRestaurant, onMenu }: { onRestaurant: () => void; onMenu: () => void }) {
  const [posts, setPosts] = useState(FEED_POSTS);
  const [activeCategory, setActiveCategory] = useState(0);

  const toggleLike = (id: number) => setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  const toggleSave = (id: number) => setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      {/* Top bar — mobile only (desktop uses sidebar header) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border px-4 pt-4 pb-3 md:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center"><span className="text-base">🍽️</span></div>
            <span className="text-xl font-extrabold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>Parchemos</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-2xl bg-gray-100"><Bell className="w-4 h-4 text-gray-700" /></button>
            <button className="w-9 h-9 flex items-center justify-center rounded-2xl bg-gray-100"><Search className="w-4 h-4 text-gray-700" /></button>
          </div>
        </div>
      </div>

      {/* Desktop header row */}
      <div className="hidden md:flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>Inicio</h2>
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
                  <img src={s.img} alt={s.name} className="w-full h-full rounded-full object-cover bg-muted" />
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
            <button key={i} onClick={() => setActiveCategory(i)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-semibold flex-shrink-0 transition-all ${activeCategory === i ? "bg-primary text-white shadow-sm shadow-orange-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              <span>{cat.icon}</span><span>{cat.label}</span>
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
                  <img src={post.user.avatar} alt={post.user.name} className="w-9 h-9 rounded-full object-cover bg-muted" />
                  <div>
                    <button onClick={onRestaurant} className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors">{post.restaurant}</button>
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
                <img src={post.img} alt={post.restaurant} className="w-full h-72 md:h-64 object-cover bg-muted" />
                {post.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                  <button onClick={() => toggleLike(post.id)} className={`w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all ${post.liked ? "scale-110" : ""}`}>
                    <Heart className={`w-5 h-5 transition-colors ${post.liked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                  </button>
                  <button onClick={() => toggleSave(post.id)} className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
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
                  <button className="flex items-center gap-1.5"><Share2 className="w-5 h-5 text-gray-700" /></button>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  <span className="font-semibold">{post.user.name}</span> {post.caption}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {post.tags.map(tag => <span key={tag} className="text-xs text-primary font-medium">{tag}</span>)}
                </div>
              </div>
              <div className="px-4 py-3 flex gap-2">
                <PrimaryButton onClick={() => {}} size="sm" className="flex-1">📅 Reservar</PrimaryButton>
                <PrimaryButton onClick={onMenu} size="sm" variant="outline" className="flex-1">🍴 Ver menú</PrimaryButton>
                <PrimaryButton onClick={onMenu} size="sm" variant="ghost" className="flex-1">🛍️ Pedir</PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DISCOVER ─────────────────────────────────────────────────────────────────
function DiscoverScreen({ onRestaurant }: { onRestaurant: () => void }) {
  const [activeFilters, setActiveFilters] = useState<string[]>(["Abierto ahora"]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<typeof RESTAURANTS_MAP[0] | null>(null);
  const filters = ["Abierto ahora", "Terraza", "Pet Friendly", "Parejas", "Grupos", "Vegan", "Fine Dining"];
  const toggleFilter = (f: string) => setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  return (
    <div className="flex flex-col h-full bg-background md:flex-row">
      {/* Left panel — filters + cards list on md+ */}
      <div className="bg-white border-b border-border md:border-b-0 md:border-r md:w-80 md:flex-shrink-0 md:flex md:flex-col lg:w-96">
        <div className="px-4 pt-4 pb-3 md:px-5 md:pt-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Descubrir</h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-muted-foreground" placeholder="Restaurantes, cocinas, lugares..." />
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-3">
            {filters.map(f => (
              <button key={f} onClick={() => toggleFilter(f)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex-shrink-0 transition-all ${activeFilters.includes(f) ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        {/* Restaurant list — vertical on md+ */}
        <div className="md:flex-1 md:overflow-y-auto">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide p-4 md:flex-col md:overflow-x-visible md:gap-2">
            {RESTAURANTS_MAP.map(r => (
              <button key={r.id} onClick={() => { setSelectedRestaurant(r); onRestaurant(); }}
                className={`flex-shrink-0 w-56 md:w-full rounded-2xl overflow-hidden shadow-sm border transition-all text-left md:flex md:flex-row ${selectedRestaurant?.id === r.id ? "border-primary shadow-orange-100 shadow-md" : "border-border"}`}>
                <div className="relative h-28 md:h-auto md:w-20 md:flex-shrink-0">
                  <img src={r.img} alt={r.name} className="w-full h-full object-cover bg-muted" />
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold md:hidden ${r.open ? "bg-accent text-white" : "bg-gray-500 text-white"}`}>
                    {r.open ? "Abierto" : "Cerrado"}
                  </div>
                </div>
                <div className="p-3 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate flex-1">{r.name}</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg hidden md:block ${r.open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{r.open ? "Abierto" : "Cerrado"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.category} · {r.price}</p>
                  <div className="flex items-center justify-between mt-2">
                    <StarRating rating={r.rating} />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{r.distance}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.tags.map(tag => <Badge key={tag} color="gray">{tag}</Badge>)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map — full height on desktop */}
      <div className="relative flex-1 min-h-64 bg-gray-100 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=800&fit=crop&auto=format" alt="map" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
        {RESTAURANTS_MAP.map(r => (
          <button key={r.id} onClick={() => setSelectedRestaurant(r)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all"
            style={{ top: `${r.lat}%`, left: `${r.lng}%` }}>
            <div className={`px-2.5 py-1.5 rounded-2xl shadow-lg text-xs font-bold flex items-center gap-1 ${selectedRestaurant?.id === r.id ? "bg-primary text-white scale-110" : "bg-white text-gray-900"}`}>
              <span>{r.price}</span>
            </div>
          </button>
        ))}
        <div className="absolute bottom-4 right-4">
          <button className="w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center"><Navigation className="w-5 h-5 text-primary" /></button>
        </div>
        {selectedRestaurant && (
          <div className="absolute bottom-4 left-4 right-16 md:left-4 md:right-4 md:max-w-xs bg-white rounded-2xl shadow-lg border border-border p-3">
            <div className="flex gap-3">
              <img src={selectedRestaurant.img} alt={selectedRestaurant.name} className="w-16 h-16 rounded-xl object-cover bg-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{selectedRestaurant.name}</p>
                <StarRating rating={selectedRestaurant.rating} count={undefined} />
                <div className="flex gap-2 mt-2">
                  <PrimaryButton onClick={onRestaurant} size="sm" className="flex-1">Ver perfil</PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RESERVATIONS ─────────────────────────────────────────────────────────────
function ReservationsScreen() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>Reservas</h2>
          <PrimaryButton size="sm" className="hidden md:flex"><Plus className="w-3.5 h-3.5" />Nueva reserva</PrimaryButton>
        </div>
        <div className="flex bg-gray-100 rounded-2xl p-1 md:max-w-xs">
          {(["upcoming", "past"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-white shadow-sm text-gray-900" : "text-muted-foreground"}`}>
              {t === "upcoming" ? "Próximas" : "Historial"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {RESERVATIONS_DATA.map(res => (
            <div key={res.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border">
              <div className="flex gap-3">
                <img src={res.img} alt={res.restaurant} className="w-16 h-16 rounded-xl object-cover bg-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{res.restaurant}</p>
                    <Badge color={res.status === "confirmed" ? "green" : "yellow"}>
                      {res.status === "confirmed" ? "Confirmada" : "Pendiente"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{res.date}</div>
                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{res.time}</div>
                    <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{res.guests} personas</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <PrimaryButton size="sm" className="flex-1">Ver detalles</PrimaryButton>
                <PrimaryButton size="sm" variant="outline" className="flex-1">Modificar</PrimaryButton>
                {res.status === "confirmed" && <PrimaryButton size="sm" variant="ghost">Cancelar</PrimaryButton>}
              </div>
            </div>
          ))}

          {/* CTA card */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-5 border border-orange-100">
            <h3 className="font-bold text-gray-900 text-base mb-1">¿A dónde parchar hoy?</h3>
            <p className="text-sm text-muted-foreground mb-3">Explora los restaurantes disponibles y reserva tu mesa.</p>
            <PrimaryButton size="sm">Explorar restaurantes</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RESTAURANT ───────────────────────────────────────────────────────────────
function RestaurantScreen({ onBack, onMenu, onOrder }: { onBack: () => void; onMenu: () => void; onOrder: () => void }) {
  const [tab, setTab] = useState("menu");
  const tabs = ["Menú", "Fotos", "Reseñas", "Eventos"];

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      <div className="relative">
        <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=500&fit=crop&auto=format" alt="restaurant" className="w-full h-56 md:h-72 lg:h-80 object-cover bg-muted" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        <button onClick={onBack} className="absolute top-4 left-4 w-9 h-9 bg-white/90 rounded-2xl flex items-center justify-center shadow-sm"><ChevronLeft className="w-5 h-5 text-gray-900" /></button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-9 h-9 bg-white/90 rounded-2xl flex items-center justify-center shadow-sm"><Share2 className="w-4 h-4 text-gray-900" /></button>
          <button className="w-9 h-9 bg-white/90 rounded-2xl flex items-center justify-center shadow-sm"><BookmarkPlus className="w-4 h-4 text-gray-900" /></button>
        </div>
      </div>

      {/* Info + CTAs */}
      <div className="bg-white px-4 pb-4 pt-4 border-b border-border md:px-6 md:pb-6">
        <div className="md:flex md:items-start md:justify-between md:gap-8">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 md:block">
              <div>
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl" style={{ fontFamily: "Poppins, sans-serif" }}>La Paloma Gastrobar</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Americana · Burgers · $$</p>
              </div>
              <div className="flex flex-col items-end gap-1 md:hidden">
                <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span className="font-bold text-gray-900">4.9</span></div>
                <span className="text-xs text-muted-foreground">2.341 reseñas</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3.5 h-3.5 text-primary" />Zona Rosa, Bogotá</div>
              <div className="flex items-center gap-1 text-xs text-accent font-semibold"><div className="w-2 h-2 rounded-full bg-accent" />Abierto · Cierra a las 11 PM</div>
              <div className="hidden md:flex items-center gap-1 text-xs"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /><span className="font-semibold text-gray-900">4.9</span><span className="text-muted-foreground">(2.341)</span></div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["Terraza", "Pet Friendly", "Wifi", "Reservas", "Parking"].map(tag => <Badge key={tag} color="gray">{tag}</Badge>)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 md:mt-0 md:flex-shrink-0 md:w-64">
            <PrimaryButton size="md" className="w-full">📅 Reservar</PrimaryButton>
            <PrimaryButton size="md" variant="outline" className="w-full" onClick={onMenu}>🍴 Ver menú</PrimaryButton>
            <PrimaryButton size="md" variant="secondary" className="w-full" onClick={onOrder}>🛍️ Pedir ahora</PrimaryButton>
            <PrimaryButton size="md" variant="ghost" className="w-full border border-gray-200">🪑 Ir a la mesa</PrimaryButton>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="flex px-4 md:px-6">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase())}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${tab === t.toLowerCase() ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Gallery */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
          {[
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200&h=200&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop&auto=format",
          ].map((src, i) => (
            <img key={i} src={src} alt="food" className={`w-full object-cover rounded-xl bg-muted ${i < 3 ? "h-24 md:h-28" : "hidden md:block h-28"}`} />
          ))}
        </div>

        <h3 className="font-bold text-gray-900 mb-3">Más pedidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MENU_SECTIONS[0].items.map(item => (
            <div key={item.id} className="flex gap-3 bg-white rounded-2xl p-3 border border-border shadow-sm">
              <img src={item.img} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary text-sm">${item.price.toLocaleString()}</span>
                  <button onClick={onOrder} className="w-7 h-7 bg-primary rounded-xl flex items-center justify-center"><Plus className="w-4 h-4 text-white" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MENU ─────────────────────────────────────────────────────────────────────
function MenuScreen({ onBack, onOrderSummary }: { onBack: () => void; onOrderSummary: () => void }) {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [activeSection, setActiveSection] = useState(0);

  const addToCart = (id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: number) => setCart(prev => {
    const n = (prev[id] || 0) - 1;
    if (n <= 0) { const next = { ...prev }; delete next[id]; return next; }
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
            <button onClick={onBack} className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center"><ChevronLeft className="w-5 h-5 text-gray-900" /></button>
            <div>
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>La Paloma Gastrobar</h2>
              <p className="text-xs text-muted-foreground">Menú · 12 opciones</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {MENU_SECTIONS.map((s, i) => (
              <button key={i} onClick={() => setActiveSection(i)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex-shrink-0 transition-all ${activeSection === i ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}>
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
                        <img src={item.img} alt={item.name} className="w-24 h-24 rounded-xl object-cover bg-muted" />
                        {item.popular && (
                          <div className="absolute -top-1 -left-1 bg-secondary text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-lg">🔥 Popular</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5" />{item.time}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Flame className="w-3.5 h-3.5" />{item.calories} cal</div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-primary text-base">${item.price.toLocaleString()}</span>
                          {cart[item.id] ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"><Minus className="w-3.5 h-3.5 text-gray-700" /></button>
                              <span className="w-5 text-center font-bold text-sm text-gray-900">{cart[item.id]}</span>
                              <button onClick={() => addToCart(item.id)} className="w-7 h-7 bg-primary rounded-xl flex items-center justify-center"><Plus className="w-3.5 h-3.5 text-white" /></button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(item.id)} className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-orange-200 hover:bg-orange-600 transition-colors"><Plus className="w-4 h-4 text-white" /></button>
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
            <button onClick={onOrderSummary} className="w-full bg-primary text-white rounded-2xl py-4 flex items-center justify-between px-5 shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center"><span className="text-sm font-bold">{totalItems}</span></div>
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
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-muted-foreground" /></div>
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
                    <img src={item.img} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-primary font-bold mt-0.5">${(item.price * qty).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                      <span className="text-xs font-bold w-4 text-center">{qty}</span>
                      <button onClick={() => addToCart(item.id)} className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center"><Plus className="w-3 h-3 text-white" /></button>
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
            <button onClick={onOrderSummary} className="w-full bg-primary text-white rounded-2xl py-3.5 font-bold text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all">
              Ver pedido completo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ORDER SUMMARY ────────────────────────────────────────────────────────────
function OrderSummaryScreen({ onBack, onPayment }: { onBack: () => void; onPayment: () => void }) {
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [guests, setGuests] = useState(2);

  const items = [
    { name: "Double Smash BBQ", qty: 2, price: 36500 },
    { name: "Smash Burger Clásica", qty: 1, price: 28500 },
    { name: "Papas Smash Cargadas", qty: 2, price: 18500 },
    { name: "Milkshake Vainilla", qty: 2, price: 16500 },
  ];
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const service = Math.round(subtotal * 0.1);
  const total = subtotal + service;

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center"><ChevronLeft className="w-5 h-5 text-gray-900" /></button>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>Mi Pedido</h2>
        </div>
      </div>

      <div className="p-4 md:p-6 md:max-w-4xl md:mx-auto md:w-full">
        <div className="md:grid md:grid-cols-2 md:gap-6 flex flex-col gap-4">
          {/* Left col */}
          <div className="flex flex-col gap-4">
            {/* Status */}
            <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-accent/10 rounded-2xl flex items-center justify-center"><ChefHat className="w-5 h-5 text-accent" /></div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Estado del pedido</p>
                  <p className="text-xs text-accent font-semibold">Preparando tu orden...</p>
                </div>
                <div className="ml-auto text-right"><p className="font-bold text-gray-900">~18 min</p><p className="text-xs text-muted-foreground">Tiempo estimado</p></div>
              </div>
              <div className="flex items-center gap-2">
                {["Recibido", "Preparando", "Listo", "Entregado"].map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i <= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>
                      {i <= 1 ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    {i < 3 && <div className={`flex-1 h-0.5 ${i < 1 ? "bg-primary" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {["Recibido", "Preparando", "Listo", "Entregado"].map(step => (
                  <span key={step} className="text-xs text-muted-foreground text-center" style={{ width: "25%" }}>{step}</span>
                ))}
              </div>
            </div>

            {/* Split */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div><p className="font-semibold text-gray-900 text-sm">Dividir cuenta</p><p className="text-xs text-muted-foreground">Invita a tus amigos mediante QR</p></div>
                <button onClick={() => setSplitEnabled(!splitEnabled)} className={`w-12 h-6 rounded-full transition-all ${splitEnabled ? "bg-primary" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all mx-0.5 ${splitEnabled ? "translate-x-6" : ""}`} />
                </button>
              </div>
              {splitEnabled && (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center"><QrCode className="w-8 h-8 text-gray-500" /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Escanea para unirte</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Cada persona paga su parte</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-bold text-gray-900">{guests} personas</span>
                      <button onClick={() => setGuests(guests + 1)} className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center"><Plus className="w-3 h-3" /></button>
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
              <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-gray-900">Resumen del pedido</p></div>
              {items.map((item, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < items.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center text-xs font-bold text-primary">{item.qty}</div>
                    <span className="text-sm text-gray-800">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">${(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="px-4 py-3 border-t border-border bg-gray-50">
                <div className="flex justify-between mb-1.5"><span className="text-sm text-muted-foreground">Subtotal</span><span className="text-sm text-gray-700">${subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between mb-1.5"><span className="text-sm text-muted-foreground">Servicio (10%)</span><span className="text-sm text-gray-700">${service.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-border"><span className="text-gray-900">Total</span><span className="text-primary text-lg">${total.toLocaleString()}</span></div>
              </div>
            </div>
            <PrimaryButton onClick={onPayment} size="lg" className="w-full">💳 Ir a pagar · ${total.toLocaleString()}</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAYMENT ──────────────────────────────────────────────────────────────────
function PaymentScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [selectedMethod, setSelectedMethod] = useState("apple");
  const [paid, setPaid] = useState(false);
  const methods = [
    { id: "apple", icon: "🍎", label: "Apple Pay", sub: "Visa •••• 4821" },
    { id: "google", icon: "G", label: "Google Pay", sub: "Mastercard •••• 3902" },
    { id: "card", icon: "💳", label: "Tarjeta de crédito", sub: "Agregar tarjeta" },
    { id: "nequi", icon: "N", label: "Nequi", sub: "+57 310 987 6543" },
    { id: "pse", icon: "🏦", label: "PSE", sub: "Bancolombia, Davivienda..." },
    { id: "daviplata", icon: "D", label: "Daviplata", sub: "+57 310 987 6543" },
  ];

  if (paid) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center px-6 text-center z-50">
        <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-200"><Check className="w-12 h-12 text-white" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>¡Pagado!</h2>
        <p className="text-muted-foreground mb-8">Tu pago fue procesado exitosamente</p>
        <div className="bg-gray-50 rounded-2xl p-5 w-full max-w-sm mb-8">
          <div className="flex justify-between mb-2"><span className="text-sm text-muted-foreground">Restaurante</span><span className="text-sm font-semibold">La Paloma Gastrobar</span></div>
          <div className="flex justify-between mb-2"><span className="text-sm text-muted-foreground">Total pagado</span><span className="text-sm font-bold text-accent">$155.000</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Método</span><span className="text-sm font-semibold">Apple Pay</span></div>
        </div>
        <PrimaryButton onClick={onDone} size="lg" className="w-full max-w-sm">Volver al inicio</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center"><ChevronLeft className="w-5 h-5 text-gray-900" /></button>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>Pago</h2>
        </div>
      </div>

      <div className="p-4 md:p-6 md:max-w-3xl md:mx-auto md:w-full">
        <div className="md:grid md:grid-cols-2 md:gap-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-r from-primary to-orange-400 rounded-2xl p-5 text-white">
              <p className="text-sm font-medium opacity-80">Total a pagar</p>
              <p className="text-4xl font-extrabold mt-1">$155.000</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                <p className="text-sm opacity-80">La Paloma Gastrobar · Mesa 12</p>
              </div>
            </div>
            <button onClick={() => setPaid(true)} className="w-full bg-accent text-white rounded-2xl py-4 font-bold text-base shadow-lg shadow-green-200 hover:bg-green-600 transition-all active:scale-95">
              ✓ Confirmar pago · $155.000
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-gray-900 text-sm">Método de pago</p></div>
            {methods.map(method => (
              <button key={method.id} onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0 border-border transition-colors ${selectedMethod === method.id ? "bg-orange-50" : "hover:bg-gray-50"}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${selectedMethod === method.id ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}>{method.icon}</div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? "border-primary bg-primary" : "border-gray-300"}`}>
                  {selectedMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfileScreen({ onAdminDashboard }: { onAdminDashboard: () => void }) {
  const badges = ["🔥 Foodie", "⭐ Top Reviewer", "🗺️ Explorer", "🍕 Pizza Lover", "☕ Coffee Fan"];
  const visits = [
    { name: "La Paloma Gastrobar", date: "Hace 2 días", rating: 5, img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=60&h=60&fit=crop&auto=format" },
    { name: "Castillo de Sal", date: "Hace 1 semana", rating: 4, img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=60&h=60&fit=crop&auto=format" },
    { name: "El Origen", date: "Hace 2 semanas", rating: 5, img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=60&h=60&fit=crop&auto=format" },
  ];

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-0 border-b border-border md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>Perfil</h2>
          <div className="flex gap-2">
            <button onClick={onAdminDashboard} className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center"><BarChart3 className="w-4 h-4 text-gray-700" /></button>
            <button className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center"><Settings className="w-4 h-4 text-gray-700" /></button>
          </div>
        </div>
        {/* Avatar + stats */}
        <div className="flex items-center gap-4 pb-4 md:gap-6">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format" alt="user" className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover bg-muted" />
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg flex items-center justify-center"><Camera className="w-3 h-3 text-white" /></button>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg">Juan Sebastián M.</h3>
            <p className="text-sm text-muted-foreground">@juanse.foodie</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-4 h-4 bg-secondary rounded-md flex items-center justify-center"><span className="text-xs">🏆</span></div>
              <span className="text-xs font-semibold text-yellow-600">Nivel Gourmet · 1.240 pts</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-0 border-t border-border py-4">
          {[{ value: "248", label: "Visitas" }, { value: "87", label: "Favoritos" }, { value: "43", label: "Reseñas" }, { value: "1.2K", label: "Seguidores" }].map(stat => (
            <div key={stat.label} className="text-center border-r last:border-r-0 border-border">
              <p className="font-bold text-gray-900 text-base">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:items-start flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
          <p className="font-semibold text-gray-900 mb-3">Badges</p>
          <div className="flex flex-wrap gap-2">
            {badges.map(b => (
              <span key={b} className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl text-sm font-semibold text-gray-800">{b}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden md:col-span-1 lg:col-span-2">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="font-semibold text-gray-900">Visitas recientes</p>
            <button className="text-xs text-primary font-semibold">Ver todo</button>
          </div>
          <div className="divide-y divide-border">
            {visits.map((v, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <img src={v.img} alt={v.name} className="w-12 h-12 rounded-xl object-cover bg-muted" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.date}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`w-3 h-3 ${si < v.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors md:col-span-full">
          <LogOut className="w-4 h-4" />Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ onBack }: { onBack: () => void }) {
  const totalVentas = SALES_DATA.reduce((a, b) => a + b.ventas, 0);
  const totalPedidos = SALES_DATA.reduce((a, b) => a + b.pedidos, 0);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center"><ChevronLeft className="w-5 h-5 text-gray-900" /></button>
          <div><h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>Dashboard Admin</h2><p className="text-xs text-muted-foreground">La Paloma Gastrobar</p></div>
          <div className="ml-auto"><Badge color="green">En línea</Badge></div>
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-4">
        {/* KPIs — 2 cols on mobile, 4 on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Ventas hoy", value: "$3.12M", change: "+18%", icon: DollarSign },
            { label: "Pedidos", value: "128", change: "+24", icon: ShoppingBag },
            { label: "Reservas", value: "34", change: "+5", icon: Calendar },
            { label: "Rating", value: "4.9 ⭐", change: "+0.1", icon: Star },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-border shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3 text-accent" />
                <span className="text-xs font-semibold text-accent">{kpi.change}</span>
                <span className="text-xs text-muted-foreground">vs ayer</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts — stack on mobile, side by side on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">Ventas esta semana</p>
              <span className="text-xs text-primary font-semibold">${(totalVentas / 1000000).toFixed(1)}M total</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={SALES_DATA}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6C757D" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, "Ventas"]} contentStyle={{ borderRadius: 12, border: "1px solid #E9ECEF", fontSize: 12 }} />
                <Area type="monotone" dataKey="ventas" stroke="#FF6B35" strokeWidth={2.5} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">Pedidos por día</p>
              <span className="text-xs text-primary font-semibold">{totalPedidos} esta semana</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={SALES_DATA} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6C757D" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => [v, "Pedidos"]} contentStyle={{ borderRadius: 12, border: "1px solid #E9ECEF", fontSize: 12 }} />
                <Bar dataKey="pedidos" fill="#F4B400" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active orders */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="font-semibold text-gray-900">Pedidos activos</p>
            <Badge color="orange">12 pendientes</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              { table: "Mesa 3", order: "2x Smash Burger, 1x Papas", time: "8 min", status: "cooking" },
              { table: "Mesa 7", order: "1x Double BBQ, 2x Milkshake", time: "14 min", status: "ready" },
              { table: "Mesa 11", order: "3x Smash Clásica, 3x Aros", time: "3 min", status: "new" },
            ].map((order, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0"><Utensils className="w-5 h-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{order.table}</p>
                  <p className="text-xs text-muted-foreground truncate">{order.order}</p>
                </div>
                <div className="text-right">
                  <Badge color={order.status === "ready" ? "green" : order.status === "new" ? "blue" : "yellow"}>
                    {order.status === "ready" ? "Listo" : order.status === "new" ? "Nuevo" : "Preparando"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
function OrdersScreen({ onOrderSummary }: { onOrderSummary: () => void }) {
  const history = [
    { restaurant: "El Origen", date: "Hace 3 días", items: "Bowl de quinoa, Jugo verde", total: 42000, rating: 5, img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=60&h=60&fit=crop&auto=format" },
    { restaurant: "Castillo de Sal", date: "Hace 1 semana", items: "Ceviche, Arroz con mariscos", total: 89500, rating: 4, img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=60&h=60&fit=crop&auto=format" },
    { restaurant: "La Paloma Gastrobar", date: "Hace 2 semanas", items: "Double Smash BBQ, Papas", total: 73000, rating: 5, img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=60&h=60&fit=crop&auto=format" },
  ];

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6 md:pt-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>Pedidos</h2>
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-4">
        {/* Active order */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-sm font-semibold text-primary">Pedido activo</p>
          </div>
          <div className="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=60&h=60&fit=crop&auto=format" alt="rest" className="w-14 h-14 rounded-xl object-cover bg-muted" />
            <div className="flex-1">
              <p className="font-bold text-gray-900">La Paloma Gastrobar</p>
              <p className="text-sm text-muted-foreground">Mesa 12 · 4 items</p>
              <div className="flex items-center gap-1 mt-1"><Clock className="w-3.5 h-3.5 text-primary" /><span className="text-sm text-primary font-semibold">~18 min restantes</span></div>
            </div>
          </div>
          <button onClick={onOrderSummary} className="w-full mt-3 bg-white border border-orange-200 rounded-xl py-2.5 text-sm font-semibold text-primary hover:bg-orange-50 transition-colors">
            Ver estado del pedido
          </button>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-gray-900">Historial de pedidos</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 divide-border">
            {history.map((order, i) => (
              <div key={i} className="px-4 py-3.5 border-b last:border-b-0 md:border-b-0 md:border-r last:border-r-0 border-border">
                <div className="flex gap-3">
                  <img src={order.img} alt={order.restaurant} className="w-12 h-12 rounded-xl object-cover bg-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><p className="text-sm font-semibold text-gray-900">{order.restaurant}</p><p className="text-sm font-bold text-gray-900">${order.total.toLocaleString()}</p></div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{order.items}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{order.date}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => <Star key={si} className={`w-3 h-3 ${si < order.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />)}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-xl py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors">Repetir pedido</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Navigation items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Inicio" },
  { id: "discover", icon: Compass, label: "Explorar" },
  { id: "reservations", icon: CalendarCheck, label: "Reservas" },
  { id: "orders", icon: ShoppingBag, label: "Pedidos" },
  { id: "profile", icon: User, label: "Perfil" },
] as const;

// ─── Sidebar (md+) ────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onNavigate, collapsed, onToggle }: {
  activeTab: Tab; onNavigate: (tab: Tab) => void;
  collapsed: boolean; onToggle: () => void;
}) {
  return (
    <aside className={`hidden md:flex flex-col bg-white border-r border-border flex-shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-56 lg:w-60"}`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border gap-3 flex-shrink-0">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-100">
          <span className="text-base">🍽️</span>
        </div>
        {!collapsed && <span className="font-extrabold text-gray-900 text-lg truncate" style={{ fontFamily: "Poppins, sans-serif" }}>Parchemos</span>}
        <button onClick={onToggle} className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-muted-foreground flex-shrink-0">
          <MenuIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button key={id} onClick={() => onNavigate(id as Tab)} title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all ${isActive ? "bg-primary text-white shadow-sm shadow-orange-200" : "text-muted-foreground hover:bg-gray-100 hover:text-gray-900"}`}>
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!collapsed && <span className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-border flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&auto=format" alt="user" className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-900 truncate">Juan Sebastián M.</p><p className="text-xs text-muted-foreground">@juanse.foodie</p></div>
            <button className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"><LogOut className="w-3.5 h-3.5" /></button>
          </>
        )}
      </div>
    </aside>
  );
}

// ─── Desktop Header ────────────────────────────────────────────────────────────
function DesktopHeader({ activeTab, onNavigate }: { activeTab: Tab; onNavigate: (tab: Tab) => void }) {
  const currentLabel = NAV_ITEMS.find(n => n.id === activeTab)?.label ?? "Parchemos";
  return (
    <header className="hidden md:flex h-16 bg-white border-b border-border items-center px-6 gap-4 flex-shrink-0">
      <div>
        <p className="text-sm font-bold text-gray-900">{currentLabel}</p>
        <p className="text-xs text-muted-foreground">Bogotá, Colombia</p>
      </div>
      <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 max-w-sm ml-4">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-muted-foreground" placeholder="Buscar restaurantes, platos..." />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="relative w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
          <Bell className="w-4 h-4" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-white" />
        </button>
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&auto=format" alt="user" className="w-9 h-9 rounded-xl object-cover cursor-pointer" onClick={() => onNavigate("profile")} />
      </div>
    </header>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
type Screen2 = Screen;

export default function App() {
  const [screen, setScreen] = useState<Screen2>("splash");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const goTo = (s: Screen2) => setScreen(s);
  const goBack = () => {
    const backMap: Partial<Record<Screen2, Screen2>> = {
      restaurant: activeTab as Screen2, menu: "restaurant",
      "order-summary": "menu", payment: "order-summary",
      "admin-dashboard": "profile",
    };
    setScreen(backMap[screen] || (activeTab as Screen2));
  };
  const navigateTab = (tab: Tab) => { setActiveTab(tab); setScreen(tab as Screen2); };

  const showNav = !["splash", "login", "payment"].includes(screen);

  const screenNode = {
    splash: <SplashScreen onDone={() => setScreen("login")} />,
    login: <LoginScreen onLogin={() => { setScreen("home"); setActiveTab("home"); }} />,
    home: <HomeScreen onRestaurant={() => goTo("restaurant")} onMenu={() => goTo("menu")} />,
    discover: <DiscoverScreen onRestaurant={() => goTo("restaurant")} />,
    reservations: <ReservationsScreen />,
    orders: <OrdersScreen onOrderSummary={() => goTo("order-summary")} />,
    profile: <ProfileScreen onAdminDashboard={() => goTo("admin-dashboard")} />,
    restaurant: <RestaurantScreen onBack={goBack} onMenu={() => goTo("menu")} onOrder={() => goTo("menu")} />,
    menu: <MenuScreen onBack={goBack} onOrderSummary={() => goTo("order-summary")} />,
    "order-summary": <OrderSummaryScreen onBack={goBack} onPayment={() => goTo("payment")} />,
    payment: <PaymentScreen onBack={goBack} onDone={() => { setScreen("home"); setActiveTab("home"); }} />,
    "admin-dashboard": <AdminDashboard onBack={goBack} />,
  }[screen];

  // Fullscreen screens (splash, login, payment success) take over the viewport
  if (!showNav) {
    return (
      <div className="w-full h-full" style={{ fontFamily: "Poppins, Inter, sans-serif" }}>
        {screenNode}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex bg-background overflow-hidden" style={{ fontFamily: "Poppins, Inter, sans-serif" }}>
      {/* Sidebar — desktop only */}
      <Sidebar activeTab={activeTab} onNavigate={navigateTab} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop header */}
        <DesktopHeader activeTab={activeTab} onNavigate={navigateTab} />

        {/* Content — on mobile constrain to phone feel; on md+ go full width */}
        <div className="flex-1 min-h-0 overflow-hidden md:overflow-auto relative">
          {/* Mobile: centered phone container */}
          <div className="h-full md:hidden max-w-md mx-auto w-full bg-white overflow-hidden flex flex-col shadow-none">
            <div className="flex-1 min-h-0 overflow-hidden">
              {screenNode}
            </div>
            {/* Bottom nav — mobile only */}
            <div className="bg-white border-t border-border px-2 py-2 flex-shrink-0">
              <div className="flex">
                {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
                  const isActive = activeTab === id && !["restaurant", "menu", "order-summary", "admin-dashboard"].includes(screen);
                  return (
                    <button key={id} onClick={() => navigateTab(id as Tab)}
                      className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all ${isActive ? "text-primary" : "text-muted-foreground hover:text-gray-700"}`}>
                      <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-orange-50" : ""}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop/Tablet: full width content */}
          <div className="hidden md:block h-full overflow-y-auto">
            {screenNode}
          </div>
        </div>
      </div>
    </div>
  );
}
