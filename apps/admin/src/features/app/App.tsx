import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Users, Store, Shield, BarChart3,
  CreditCard, Headphones, BadgeCheck, Megaphone, Settings,
  Brain, Search, Bell, ChevronLeft, TrendingUp,
  AlertCircle, CheckCircle2, Clock, Filter,
  Download, Plus, Send, Eye, Edit3, Trash2,
  Ban, Star, MapPin, Package, Calendar,
  DollarSign, Activity, ChevronDown, LogOut,
  User, MoreHorizontal, MessageSquare,
  ArrowUpRight, ArrowDownRight, Check,
  Globe, Key, Percent, Upload, Target,
  Lightbulb, Zap, RefreshCw, X, Hash,
  FileText, Lock, ChevronRight
} from "lucide-react";
import { StatusBadge as Badge, SurfaceCard as Card, InitialsAvatar as Avatar, IconButton as ActionBtn, STATUS_COLORS, STATUS_LABELS } from "@parchemos/shared/components";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

// ─── Brand ─────────────────────────────────────────────────────
const ACCENT = "#FF6B35";

// ─── Mock Data ─────────────────────────────────────────────────

const userGrowthData = [
  { month: "Ene", users: 12400, active: 9800 },
  { month: "Feb", users: 15200, active: 11200 },
  { month: "Mar", users: 18900, active: 13600 },
  { month: "Abr", users: 22100, active: 16400 },
  { month: "May", users: 26800, active: 19200 },
  { month: "Jun", users: 31200, active: 22800 },
  { month: "Jul", users: 37600, active: 27400 },
  { month: "Ago", users: 44100, active: 32100 },
];

const ordersData = [
  { day: "Lun", orders: 342, revenue: 4820 },
  { day: "Mar", orders: 418, revenue: 6240 },
  { day: "Mié", orders: 389, revenue: 5680 },
  { day: "Jue", orders: 445, revenue: 7120 },
  { day: "Vie", orders: 612, revenue: 9840 },
  { day: "Sáb", orders: 724, revenue: 11200 },
  { day: "Dom", orders: 538, revenue: 8340 },
];

const retentionData = [
  { week: "S1", r7: 82, r30: 64, r90: 41 },
  { week: "S2", r7: 79, r30: 61, r90: 38 },
  { week: "S3", r7: 85, r30: 67, r90: 44 },
  { week: "S4", r7: 88, r30: 70, r90: 48 },
  { week: "S5", r7: 84, r30: 65, r90: 43 },
  { week: "S6", r7: 91, r30: 72, r90: 51 },
];

const cityRevData = [
  { city: "Bogotá", revenue: 142, orders: 1840 },
  { city: "Medellín", revenue: 98, orders: 1220 },
  { city: "Cali", revenue: 61, orders: 780 },
  { city: "Cartagena", revenue: 38, orders: 420 },
  { city: "Barranquilla", revenue: 28, orders: 310 },
];

const categoryData = [
  { name: "Parrilla", value: 28, color: ACCENT },
  { name: "Italiana", value: 22, color: "#212529" },
  { name: "Mexicana", value: 18, color: "#6C757D" },
  { name: "Sushi", value: 16, color: "#ADB5BD" },
  { name: "Otros", value: 16, color: "#DEE2E6" },
];

const funnelSteps = [
  { label: "Registro", value: 44100, pct: 100 },
  { label: "Descubrimiento", value: 32800, pct: 74 },
  { label: "Reserva", value: 21400, pct: 49 },
  { label: "Pedido", value: 14200, pct: 32 },
  { label: "Pago", value: 11800, pct: 27 },
];

const recentActivity = [
  { type: "user", text: "Carlos Mendoza se registró desde Bogotá", time: "hace 2 min" },
  { type: "restaurant", text: "La Leña aprobó un pedido por $84.000", time: "hace 5 min" },
  { type: "payment", text: "Pago procesado: $124.500 — Mesa 4 Distrito", time: "hace 8 min" },
  { type: "alert", text: "Alta demanda en Chapinero — 24 pedidos activos", time: "hace 12 min" },
  { type: "user", text: "Valentina Torres completó su primera reserva", time: "hace 15 min" },
  { type: "restaurant", text: "El Bandido solicita verificación de documentos", time: "hace 22 min" },
];

const alerts = [
  { level: "critical", message: "3 restaurantes con pagos pendientes superiores a 30 días", action: "Revisar" },
  { level: "warning", message: "Spike de errores en gateway Bancolombia (+340%)", action: "Ver logs" },
  { level: "info", message: "Campaña 'Viernes Parcheados' termina en 48 horas", action: "Gestionar" },
];

const users = [
  { id: 1, name: "Carlos Andrés Mendoza", email: "carlos.mendoza@gmail.com", city: "Bogotá", status: "active", joined: "12 Ene 2024", orders: 24, avatar: "CM", role: "User" },
  { id: 2, name: "Valentina Torres Ríos", email: "vale.torres@hotmail.com", city: "Medellín", status: "active", joined: "8 Feb 2024", orders: 18, avatar: "VT", role: "User" },
  { id: 3, name: "Sebastián Gómez", email: "sebas.gomez@yahoo.com", city: "Cali", status: "suspended", joined: "3 Mar 2024", orders: 6, avatar: "SG", role: "User" },
  { id: 4, name: "Mariana Herrera López", email: "mariana.h@gmail.com", city: "Bogotá", status: "active", joined: "22 Mar 2024", orders: 31, avatar: "MH", role: "Premium" },
  { id: 5, name: "Andrés Felipe Castro", email: "afelicast@outlook.com", city: "Barranquilla", status: "inactive", joined: "1 Abr 2024", orders: 2, avatar: "AC", role: "User" },
  { id: 6, name: "Camila Restrepo Villa", email: "camila.rv@gmail.com", city: "Medellín", status: "active", joined: "14 Abr 2024", orders: 42, avatar: "CR", role: "Premium" },
  { id: 7, name: "Diego Rodríguez Mora", email: "diego.rod@gmail.com", city: "Cartagena", status: "blocked", joined: "27 Abr 2024", orders: 0, avatar: "DR", role: "User" },
  { id: 8, name: "Natalia Vargas Pinto", email: "natalia.vp@icloud.com", city: "Bogotá", status: "active", joined: "5 May 2024", orders: 15, avatar: "NV", role: "User" },
];

const restaurants = [
  { id: 1, name: "La Leña Parrilla", category: "Parrilla", city: "Bogotá", status: "verified", rating: 4.8, sales: 2840000, reservations: 142, logo: "LL" },
  { id: 2, name: "El Bandido Mexicano", category: "Mexicana", city: "Medellín", status: "pending", rating: 4.5, sales: 1620000, reservations: 88, logo: "EB" },
  { id: 3, name: "Sushi Nagoya", category: "Japonesa", city: "Bogotá", status: "verified", rating: 4.9, sales: 3240000, reservations: 201, logo: "SN" },
  { id: 4, name: "Trattoria Bacco", category: "Italiana", city: "Cartagena", status: "suspended", rating: 4.1, sales: 840000, reservations: 34, logo: "TB" },
  { id: 5, name: "Andrés Carne de Res", category: "Parrilla", city: "Bogotá", status: "verified", rating: 4.7, sales: 8200000, reservations: 620, logo: "AC" },
  { id: 6, name: "Masa", category: "Contemporánea", city: "Bogotá", status: "verified", rating: 4.6, sales: 4100000, reservations: 318, logo: "MA" },
  { id: 7, name: "Madre", category: "Colombiana", city: "Medellín", status: "pending", rating: 4.4, sales: 1240000, reservations: 72, logo: "MD" },
  { id: 8, name: "Carmen", category: "Fusión", city: "Medellín", status: "verified", rating: 4.9, sales: 5800000, reservations: 442, logo: "CA" },
];

const moderationItems = [
  { id: 1, type: "post", author: "Carlos Mendoza", content: "El mejor lomo al trapo que he probado 🔥 El servicio en La Leña fue increíble, el maître Ricardo nos atendió perfectamente. Totalmente recomendado.", reports: 0, time: "hace 10 min", status: "pending", restaurant: "La Leña Parrilla" },
  { id: 2, type: "review", author: "María García", content: "Servicio pésimo. Esperamos 2 horas y el pedido llegó frío. No recomendable para nada. Solicito reembolso.", reports: 3, time: "hace 25 min", status: "reported", restaurant: "Trattoria Bacco" },
  { id: 3, type: "story", author: "Valentina Torres", content: "Historia: tarde de sushi en Nagoya 🍣✨", reports: 0, time: "hace 1h", status: "approved", restaurant: "Sushi Nagoya" },
  { id: 4, type: "comment", author: "Diego Rodríguez", content: "Este lugar es una completa estafa, cobran doble y el menú no tiene precios claros. ¡Cuidado con este sitio!", reports: 8, time: "hace 2h", status: "reported", restaurant: "Andrés Carne de Res" },
  { id: 5, type: "post", author: "Sebastián Gómez", content: "Nuevo restaurante en Chapinero que vale MUCHO la pena. Pedimos el menú degustación de 7 tiempos.", reports: 0, time: "hace 3h", status: "approved", restaurant: "Masa" },
];

const tickets = [
  { id: "TK-4821", user: "Carlos Mendoza", subject: "Cobro duplicado en pedido #8241", priority: "high", status: "open", created: "hace 2h", category: "Pagos" },
  { id: "TK-4820", user: "Restaurante La Leña", subject: "No puedo actualizar el menú", priority: "medium", status: "in_progress", created: "hace 4h", category: "Técnico" },
  { id: "TK-4819", user: "Valentina Torres", subject: "Reserva cancelada sin previo aviso", priority: "high", status: "open", created: "hace 5h", category: "Reservas" },
  { id: "TK-4818", user: "Andrés Castro", subject: "Cuenta bloqueada incorrectamente", priority: "critical", status: "escalated", created: "hace 8h", category: "Cuenta" },
  { id: "TK-4817", user: "Sushi Nagoya", subject: "Solicitud de ajuste de comisión", priority: "low", status: "closed", created: "hace 1d", category: "Finanzas" },
  { id: "TK-4816", user: "Mariana Herrera", subject: "No llegan notificaciones push", priority: "medium", status: "open", created: "hace 1d", category: "Técnico" },
];

const pendingVerifications = [
  {
    id: 1, name: "El Bandido Mexicano", owner: "Juan Camilo Pérez", city: "Medellín",
    submitted: "hace 2 días", docs: ["RUT ✓", "Cámara de Comercio ✓", "Datos bancarios ✓"], status: "reviewing",
    address: "Calle 33 #65-12, El Poblado",
  },
  {
    id: 2, name: "Madre", owner: "Alejandro Cano", city: "Medellín",
    submitted: "hace 3 días", docs: ["RUT ✓", "Cámara de Comercio ✓", "Datos bancarios ✗"], status: "pending_docs",
    address: "Carrera 36 #10A-27, Laureles",
  },
  {
    id: 3, name: "Palomino", owner: "Sandra Ruiz", city: "Bogotá",
    submitted: "hace 1 día", docs: ["RUT ✓", "Cámara de Comercio ✓", "Datos bancarios ✓", "Permiso sanitario ✓"], status: "ready",
    address: "Calle 85 #12-38, Usaquén",
  },
];

const campaigns = [
  { id: 1, name: "Viernes Parcheados", status: "active", type: "Descuento", reach: 28400, conversions: 1240, ctr: 4.37, ends: "3 días", budget: 2000000 },
  { id: 2, name: "Sabor Bogotá", status: "active", type: "Banner", reach: 45200, conversions: 2180, ctr: 4.82, ends: "12 días", budget: 4500000 },
  { id: 3, name: "Noche de Sushi", status: "scheduled", type: "Notificación", reach: 0, conversions: 0, ctr: 0, ends: "en 5 días", budget: 800000 },
  { id: 4, name: "Brunch de Domingo", status: "ended", type: "Descuento", reach: 62100, conversions: 3420, ctr: 5.51, ends: "Finalizada", budget: 3200000 },
];

const transactions = [
  { id: "TXN-9921", restaurant: "Andrés Carne de Res", amount: 284000, commission: 28400, status: "completed", date: "Hoy, 14:32" },
  { id: "TXN-9920", restaurant: "Sushi Nagoya", amount: 142000, commission: 14200, status: "completed", date: "Hoy, 13:18" },
  { id: "TXN-9919", restaurant: "La Leña Parrilla", amount: 96000, commission: 9600, status: "pending", date: "Hoy, 12:44" },
  { id: "TXN-9918", restaurant: "Masa", amount: 218000, commission: 21800, status: "completed", date: "Hoy, 11:20" },
  { id: "TXN-9917", restaurant: "Carmen", amount: 380000, commission: 38000, status: "refunded", date: "Hoy, 10:05" },
  { id: "TXN-9916", restaurant: "Trattoria Bacco", amount: 124000, commission: 12400, status: "failed", date: "Ayer, 22:10" },
];

const aiMessages = [
  { role: "assistant" as const, text: "Hola, soy el asistente de Parchemos Console. Puedo responder preguntas sobre usuarios, restaurantes, ingresos, campañas y más. ¿En qué te puedo ayudar hoy?" },
];

const aiInsights = [
  { icon: TrendingUp, color: "text-emerald-600 bg-emerald-50", title: "Restaurantes en crecimiento", text: "Sushi Nagoya y Carmen lideran con +34% y +28% en reservas vs. el mes anterior." },
  { icon: AlertCircle, color: "text-amber-600 bg-amber-50", title: "Riesgo de abandono", text: "1,240 usuarios en Medellín sin actividad hace más de 21 días. Considera una campaña de reactivación." },
  { icon: MapPin, color: "text-blue-600 bg-blue-50", title: "Ciudad más rentable", text: "Bogotá generó el 58% de los ingresos del mes. Chapinero es la zona con mayor densidad de pedidos." },
  { icon: Zap, color: `text-[${ACCENT}] bg-[#FFF1EB]`, title: "Predicción fin de semana", text: "Se proyecta un incremento del 18% en reservas este sábado entre 7–10 PM." },
];

// ─── Shared UI ─────────────────────────────────────────────────

function StatCard({
  label, value, change, up, icon: Icon, accent = false, sub,
}: {
  label: string; value: string; change?: string; up?: boolean; icon: any; accent?: boolean; sub?: string;
}) {
  return (
    <Card className="p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? "bg-[#FFF1EB]" : "bg-gray-50"}`}>
          <Icon size={17} className={accent ? "text-[#FF6B35]" : "text-gray-400"} />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 text-[11px] font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
            {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {change}
          </span>
        )}
      </div>
      <div className="text-[22px] font-semibold text-gray-900 tracking-tight mb-0.5">{value}</div>
      <div className="text-[13px] text-gray-500">{label}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-1">{sub}</div>}
    </Card>
  );
}

function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-[17px] font-semibold text-gray-900">{title}</h2>
        {sub && <p className="text-[13px] text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg text-[12px]">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {typeof p.value === "number" && p.value > 1000 ? p.value.toLocaleString("es-CO") : p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Views ─────────────────────────────────────────────────────

function DashboardView() {
  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Usuarios registrados" value="44,100" change="+18.2%" up icon={Users} />
        <StatCard label="Usuarios activos" value="32,100" change="+14.6%" up icon={Activity} accent />
        <StatCard label="Restaurantes" value="1,284" sub="948 verificados" change="+8.4%" up icon={Store} />
        <StatCard label="Pedidos hoy" value="538" change="+12.1%" up icon={Package} />
        <StatCard label="Reservas hoy" value="214" change="+6.8%" up icon={Calendar} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Pagos procesados" value="$8.4M" change="+22.3%" up icon={CreditCard} accent />
        <StatCard label="Comisiones del mes" value="$842K" change="+19.1%" up icon={DollarSign} />
        <StatCard label="Ticket promedio" value="$68.400" change="+5.2%" up icon={TrendingUp} />
        <StatCard label="Tickets de soporte" value="24 abiertos" change="-8.4%" up={false} icon={Headphones} />
      </div>

      {/* Alerts */}
      {alerts.map((a, i) => (
        <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] ${STATUS_COLORS[a.level]}`}>
          <AlertCircle size={15} className="flex-shrink-0" />
          <span className="flex-1">{a.message}</span>
          <button className="font-medium underline underline-offset-2 flex-shrink-0">{a.action}</button>
        </div>
      ))}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900">Crecimiento de usuarios</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">Usuarios registrados vs. activos — 2024</p>
            </div>
            <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Últimos 8 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#212529" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#212529" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" name="Registrados" stroke={ACCENT} strokeWidth={2} fill="url(#gUsers)" />
              <Area type="monotone" dataKey="active" name="Activos" stroke="#212529" strokeWidth={2} fill="url(#gActive)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-gray-900">Pedidos por día</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ordersData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="Pedidos" fill={ACCENT} radius={[5, 5, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Activity */}
        <Card className="xl:col-span-2 p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Actividad reciente</h3>
          <div className="space-y-0">
            {recentActivity.map((item, i) => (
              <div key={i} className={`flex items-start gap-3 py-3 ${i < recentActivity.length - 1 ? "border-b border-gray-50" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  item.type === "alert" ? "bg-amber-50" : item.type === "payment" ? "bg-emerald-50" : "bg-gray-50"
                }`}>
                  {item.type === "user" && <User size={12} className="text-gray-500" />}
                  {item.type === "restaurant" && <Store size={12} className="text-gray-500" />}
                  {item.type === "payment" && <DollarSign size={12} className="text-emerald-600" />}
                  {item.type === "alert" && <AlertCircle size={12} className="text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-700">{item.text}</p>
                </div>
                <span className="text-[11px] text-gray-400 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* City breakdown */}
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Ingresos por ciudad</h3>
          <div className="space-y-3">
            {cityRevData.map((c, i) => (
              <div key={c.city}>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="text-gray-700 font-medium">{c.city}</span>
                  <span className="text-gray-500">${c.revenue}M</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(c.revenue / 142) * 100}%`,
                      backgroundColor: i === 0 ? ACCENT : `rgba(33,37,41,${0.7 - i * 0.12})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-50">
            <h4 className="text-[13px] font-medium text-gray-700 mb-3">Categorías top</h4>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={22} outerRadius={36} dataKey="value" strokeWidth={0}>
                      {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {categoryData.slice(0, 4).map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-gray-600">{c.name}</span>
                    <span className="text-gray-400 ml-auto">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function UsersView() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const filtered = users.filter(u =>
    (filterStatus === "all" || u.status === filterStatus) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Gestión de usuarios"
        sub={`${users.length} usuarios registrados`}
        action={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Download size={13} /> Exportar
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-white rounded-xl transition-colors" style={{ background: ACCENT }}>
              <Plus size={13} /> Nuevo usuario
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]/50"
          />
        </div>
        {(["all", "active", "inactive", "suspended", "blocked"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-2 text-[12px] font-medium rounded-xl transition-colors border ${filterStatus === s ? "border-[#FF6B35]/30 bg-[#FFF1EB] text-[#FF6B35]" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            {s === "all" ? "Todos" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-5 py-3">Usuario</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Ciudad</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Rol</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Estado</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Pedidos</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Registro</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={u.avatar} />
                      <div>
                        <div className="text-[13px] font-medium text-gray-900">{u.name}</div>
                        <div className="text-[11px] text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                      <MapPin size={11} className="text-gray-400" />{u.city}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${u.role === "Premium" ? "bg-[#FFF1EB] text-[#FF6B35]" : "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3.5"><Badge status={u.status} /></td>
                  <td className="px-4 py-3.5 text-[13px] text-gray-600 font-medium">{u.orders}</td>
                  <td className="px-4 py-3.5 text-[12px] text-gray-400">{u.joined}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionBtn icon={Eye} label="Ver perfil" />
                      <ActionBtn icon={Edit3} label="Editar" />
                      <ActionBtn icon={Ban} label="Suspender" />
                      <ActionBtn icon={Trash2} label="Eliminar" danger />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function RestaurantsView() {
  const [search, setSearch] = useState("");
  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Gestión de restaurantes"
        sub={`${restaurants.length} restaurantes · ${restaurants.filter(r => r.status === "verified").length} verificados`}
        action={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter size={13} /> Filtros
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-white rounded-xl" style={{ background: ACCENT }}>
              <Plus size={13} /> Añadir
            </button>
          </div>
        }
      />

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar restaurante..."
          className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(r => (
          <Card key={r.id} className="p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[13px] font-bold text-gray-600">
                  {r.logo}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-gray-900">{r.name}</div>
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mt-0.5">
                    <MapPin size={10} /> {r.city} · {r.category}
                  </div>
                </div>
              </div>
              <Badge status={r.status} />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="bg-gray-50 rounded-xl py-2.5">
                <div className="flex items-center justify-center gap-1 text-[11px] text-amber-500 font-medium mb-0.5">
                  <Star size={10} /> {r.rating}
                </div>
                <div className="text-[10px] text-gray-400">Rating</div>
              </div>
              <div className="bg-gray-50 rounded-xl py-2.5">
                <div className="text-[11px] font-semibold text-gray-800 mb-0.5">${(r.sales / 1000000).toFixed(1)}M</div>
                <div className="text-[10px] text-gray-400">Ventas</div>
              </div>
              <div className="bg-gray-50 rounded-xl py-2.5">
                <div className="text-[11px] font-semibold text-gray-800 mb-0.5">{r.reservations}</div>
                <div className="text-[10px] text-gray-400">Reservas</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-3 border-t border-gray-50">
              {r.status === "pending" && (
                <button className="flex-1 py-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                  Aprobar
                </button>
              )}
              <button className="flex-1 py-1.5 text-[12px] font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Ver perfil
              </button>
              <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ModerationView() {
  const [filter, setFilter] = useState("all");

  const filtered = moderationItems.filter(m => filter === "all" || m.status === filter);

  const typeBadge = (type: string) => {
    const map: Record<string, string> = {
      post: "bg-blue-50 text-blue-700", review: "bg-purple-50 text-purple-700",
      story: "bg-emerald-50 text-emerald-700", comment: "bg-gray-100 text-gray-600",
    };
    const labels: Record<string, string> = { post: "Publicación", review: "Reseña", story: "Historia", comment: "Comentario" };
    return { cls: map[type] || "bg-gray-100 text-gray-600", label: labels[type] || type };
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Moderación de contenido"
        sub="Publicaciones, reseñas, historias y comentarios"
        action={
          <div className="flex items-center gap-2 text-[12px]">
            <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg font-medium">
              {moderationItems.filter(m => m.status === "reported").length} reportados
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium">
              {moderationItems.filter(m => m.status === "pending").length} pendientes
            </span>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        {(["all", "pending", "reported", "approved"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-2 text-[12px] font-medium rounded-xl transition-colors border ${filter === s ? "border-[#FF6B35]/30 bg-[#FFF1EB] text-[#FF6B35]" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            {s === "all" ? "Todo" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(item => {
          const tb = typeBadge(item.type);
          return (
            <Card key={item.id} className="p-5">
              <div className="flex items-start gap-4">
                <Avatar initials={item.author.slice(0, 2).toUpperCase()} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-[13px] font-semibold text-gray-900">{item.author}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${tb.cls}`}>{tb.label}</span>
                    <span className="text-[12px] text-gray-400">en <span className="text-gray-600">{item.restaurant}</span></span>
                    <span className="text-[11px] text-gray-400 ml-auto">{item.time}</span>
                  </div>
                  <p className="text-[13px] text-gray-700 leading-relaxed mb-3">{item.content}</p>
                  <div className="flex items-center gap-3">
                    <Badge status={item.status} />
                    {item.reports > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-red-600 font-medium">
                        <AlertCircle size={11} /> {item.reports} reportes
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                        <Check size={11} /> Aprobar
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <Eye size={11} /> Ocultar
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 size={11} /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Analítica de plataforma" sub="Métricas clave, retención, embudos y rendimiento" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Usuarios activos (30d)" value="32,100" change="+14.6%" up icon={Activity} accent />
        <StatCard label="Retención 7 días" value="88%" change="+3.2pp" up icon={TrendingUp} />
        <StatCard label="Ticket promedio" value="$68.400" change="+5.1%" up icon={DollarSign} />
        <StatCard label="Tasa de conversión" value="27%" change="-1.2pp" up={false} icon={Target} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-1">Retención de usuarios</h3>
          <p className="text-[12px] text-gray-500 mb-4">Tasas de retención D7, D30 y D90</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={retentionData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[20, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="r7" name="D7" stroke={ACCENT} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="r30" name="D30" stroke="#212529" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="r90" name="D90" stroke="#ADB5BD" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            {[{ label: "D7", color: ACCENT }, { label: "D30", color: "#212529" }, { label: "D90", color: "#ADB5BD" }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="w-3 h-0.5 rounded" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-1">Ingresos por ciudad</h3>
          <p className="text-[12px] text-gray-500 mb-4">Millones COP — últimos 30 días</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cityRevData} layout="vertical" margin={{ top: 4, right: 24, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="city" type="category" tick={{ fontSize: 11, fill: "#6C757D" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Ingresos ($M)" fill={ACCENT} radius={[0, 5, 5, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Funnel */}
      <Card className="p-5">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-1">Embudo de conversión</h3>
        <p className="text-[12px] text-gray-500 mb-5">Registro → Descubrimiento → Reserva → Pedido → Pago</p>
        <div className="flex flex-col gap-2">
          {funnelSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className="w-24 text-right text-[12px] text-gray-500">{step.label}</div>
              <div className="flex-1 h-9 bg-gray-50 rounded-xl overflow-hidden relative">
                <div
                  className="h-full rounded-xl flex items-center justify-end pr-3 transition-all duration-500"
                  style={{
                    width: `${step.pct}%`,
                    background: i === 0 ? ACCENT : `rgba(255,107,53,${1 - i * 0.15})`,
                  }}
                >
                  <span className="text-[11px] font-semibold text-white/90">{step.value.toLocaleString("es-CO")}</span>
                </div>
              </div>
              <div className="w-10 text-left text-[12px] font-semibold" style={{ color: i === 0 ? ACCENT : "#6C757D" }}>{step.pct}%</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function FinancesView() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Finanzas"
        sub="Ingresos, comisiones, reembolsos y transacciones"
        action={
          <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download size={13} /> Exportar reporte
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Ingresos del mes" value="$28.4M" change="+22.3%" up icon={DollarSign} accent />
        <StatCard label="Comisiones" value="$2.84M" sub="10% promedio" change="+19.1%" up icon={Percent} />
        <StatCard label="Reembolsos" value="$124K" sub="14 transacciones" change="+2.1%" up={false} icon={RefreshCw} />
        <StatCard label="Pagos fallidos" value="$84K" sub="8 transacciones" change="-12.4%" up icon={AlertCircle} />
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-semibold text-gray-900">Ingresos diarios</h3>
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
              <span className="text-[13px] font-semibold text-gray-900">$8.34M</span> esta semana
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ordersData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Ingresos" stroke={ACCENT} strokeWidth={2} fill="url(#gRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Resumen</h3>
          <div className="space-y-3">
            {[
              { label: "Bancolombia PSE", val: "38%", amount: "$10.8M" },
              { label: "Tarjeta Crédito", val: "31%", amount: "$8.8M" },
              { label: "Nequi / Daviplata", val: "24%", amount: "$6.8M" },
              { label: "Efectivo / Contra", val: "7%", amount: "$2.0M" },
            ].map(p => (
              <div key={p.label} className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-gray-800">{p.label}</div>
                  <div className="text-[11px] text-gray-400">{p.val} del total</div>
                </div>
                <span className="text-[13px] font-semibold text-gray-900">{p.amount}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-gray-900">Transacciones recientes</h3>
          <button className="text-[12px] text-[#FF6B35] font-medium">Ver todas</button>
        </div>
        <div className="divide-y divide-gray-50">
          {transactions.map(t => (
            <div key={t.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50">
              <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard size={14} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-900">{t.restaurant}</div>
                <div className="text-[11px] text-gray-400">{t.id} · {t.date}</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold text-gray-900">${t.amount.toLocaleString("es-CO")}</div>
                <div className="text-[11px] text-emerald-600">+${t.commission.toLocaleString("es-CO")} comisión</div>
              </div>
              <Badge status={t.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SupportView() {
  const priorityDot: Record<string, string> = {
    critical: "bg-red-500", high: "bg-red-400", medium: "bg-amber-400", low: "bg-gray-300",
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Centro de soporte"
        sub={`${tickets.filter(t => t.status === "open" || t.status === "escalated").length} tickets activos`}
        action={
          <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-white rounded-xl" style={{ background: ACCENT }}>
            <Plus size={13} /> Crear ticket
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Abiertos" value={`${tickets.filter(t => t.status === "open").length}`} icon={MessageSquare} />
        <StatCard label="En progreso" value={`${tickets.filter(t => t.status === "in_progress").length}`} icon={Clock} accent />
        <StatCard label="Escalados" value={`${tickets.filter(t => t.status === "escalated").length}`} icon={AlertCircle} />
        <StatCard label="Cerrados hoy" value={`${tickets.filter(t => t.status === "closed").length}`} icon={CheckCircle2} />
      </div>

      <Card>
        <div className="divide-y divide-gray-50">
          {tickets.map(ticket => (
            <div key={ticket.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[ticket.priority] || "bg-gray-300"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold text-gray-900">{ticket.subject}</span>
                  <span className="text-[11px] text-gray-400 font-mono">{ticket.id}</span>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-gray-500">
                  <span>{ticket.user}</span>
                  <span className="text-gray-300">·</span>
                  <span>{ticket.category}</span>
                  <span className="text-gray-300">·</span>
                  <span>{ticket.created}</span>
                </div>
              </div>
              <Badge status={ticket.priority} />
              <Badge status={ticket.status} />
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ActionBtn icon={Eye} label="Ver" />
                <ActionBtn icon={Edit3} label="Responder" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function VerificationView() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Verificación de restaurantes"
        sub="Revisión de documentos, datos bancarios y ubicación"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <StatCard label="En revisión" value="3" icon={Clock} />
        <StatCard label="Aprobados este mes" value="28" change="+12" up icon={CheckCircle2} accent />
        <StatCard label="Rechazados" value="4" icon={AlertCircle} />
      </div>

      <div className="space-y-4">
        {pendingVerifications.map(v => (
          <Card key={v.id} className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[14px] font-bold text-gray-600 flex-shrink-0">
                {v.name.slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900">{v.name}</h3>
                    <div className="flex items-center gap-3 text-[12px] text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1"><User size={11} /> {v.owner}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {v.address}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {v.submitted}</span>
                    </div>
                  </div>
                  <Badge status={v.status} />
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {v.docs.map(d => (
                    <span key={d} className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${d.includes("✓") ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                      <FileText size={10} className="inline mr-1" />{d}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-white rounded-xl transition-colors" style={{ background: ACCENT }}>
                    <Check size={12} /> Aprobar
                  </button>
                  <button className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors border border-amber-100">
                    <Upload size={12} /> Solicitar cambios
                  </button>
                  <button className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100">
                    <X size={12} /> Rechazar
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CampaignsView() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Campañas"
        sub="Banners, notificaciones, descuentos y segmentación"
        action={
          <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-white rounded-xl" style={{ background: ACCENT }}>
            <Plus size={13} /> Nueva campaña
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Campañas activas" value="2" icon={Zap} accent />
        <StatCard label="Alcance total" value="73.6K" change="+18%" up icon={Users} />
        <StatCard label="Conversiones" value="3,420" change="+24%" up icon={Target} />
        <StatCard label="CTR promedio" value="4.65%" change="+0.44pp" up icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {campaigns.map(c => (
          <Card key={c.id} className="p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[14px] font-semibold text-gray-900">{c.name}</h3>
                  <Badge status={c.status} />
                </div>
                <div className="flex items-center gap-3 text-[12px] text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium text-gray-600">{c.type}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {c.ends}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold text-gray-900">${(c.budget / 1000000).toFixed(1)}M</div>
                <div className="text-[11px] text-gray-400">presupuesto</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-[14px] font-semibold text-gray-900">{c.reach > 0 ? c.reach.toLocaleString("es-CO") : "—"}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Alcance</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-[14px] font-semibold text-gray-900">{c.conversions > 0 ? c.conversions.toLocaleString("es-CO") : "—"}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Conversiones</div>
              </div>
              <div className="bg-[#FFF1EB] rounded-xl p-3 text-center">
                <div className="text-[14px] font-semibold" style={{ color: ACCENT }}>{c.ctr > 0 ? `${c.ctr}%` : "—"}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "#FF8559" }}>CTR</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-3 border-t border-gray-50">
              <button className="flex-1 py-2 text-[12px] font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Ver métricas</button>
              <button className="flex-1 py-2 text-[12px] font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Editar</button>
              <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SettingsView() {
  const sections = [
    {
      title: "Roles y permisos",
      icon: Lock,
      items: ["Administrador", "Moderador", "Soporte", "Analista"],
    },
    {
      title: "Comisiones",
      icon: Percent,
      items: ["Comisión base: 10%", "Restaurantes premium: 8%", "Nuevos restaurantes: 5% (3 meses)"],
    },
    {
      title: "Métodos de pago",
      icon: CreditCard,
      items: ["Bancolombia PSE ✓", "Tarjetas Visa/MC ✓", "Nequi ✓", "Daviplata ✓"],
    },
    {
      title: "Integraciones",
      icon: Globe,
      items: ["Firebase Auth ✓", "Stripe Payments ✓", "Google Maps ✓", "Twilio SMS ✓"],
    },
    {
      title: "API Keys",
      icon: Key,
      items: ["Production key: pk_live_••••••••4f2a", "Staging key: pk_test_••••••••9c18"],
    },
    {
      title: "Impuestos",
      icon: FileText,
      items: ["IVA Colombia: 19%", "ICA Bogotá: 0.966%", "Facturación electrónica: Activo"],
    },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader title="Configuración" sub="Roles, comisiones, pagos, integraciones y API" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map(s => (
          <Card key={s.title} className="p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-[#FFF1EB] flex items-center justify-center transition-colors">
                <s.icon size={16} className="text-gray-400 group-hover:text-[#FF6B35] transition-colors" />
              </div>
              <h3 className="text-[14px] font-semibold text-gray-900">{s.title}</h3>
            </div>
            <ul className="space-y-2">
              {s.items.map(item => (
                <li key={item} className="flex items-center gap-2 text-[12px] text-gray-600">
                  <ChevronRight size={11} className="text-gray-300" />
                  {item}
                </li>
              ))}
            </ul>
            <button className="mt-4 text-[12px] font-medium text-[#FF6B35] hover:underline">Configurar →</button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AICenterView() {
  const [messages, setMessages] = useState(aiMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "¿Qué restaurantes están creciendo más?",
    "¿Qué ciudades generan más ingresos?",
    "¿Qué usuarios tienen riesgo de abandono?",
    "¿Cuál campaña tuvo mejor rendimiento?",
  ];

  const mockResponses: Record<string, string> = {
    "restaurantes": "Los 3 restaurantes con mayor crecimiento en agosto son:\n\n• **Sushi Nagoya** — +34% en reservas, +28% en pedidos\n• **Carmen** — +28% en reservas, +31% en ventas\n• **Andrés Carne de Res** — +19% en ticket promedio\n\nSushi Nagoya lidera gracias a su campaña de redes publicada el 22 de julio.",
    "ciudades": "Análisis de ingresos por ciudad este mes:\n\n• **Bogotá** — $142M (58% del total) · zona Chapinero lidera\n• **Medellín** — $98M (40% YoY) · El Poblado y Laureles en alza\n• **Cali** — $61M · crecimiento sostenido del 22%\n• **Cartagena** — $38M · pico en temporada de viajes\n\nBogotá concentra el 58% de los ingresos totales.",
    "abandono": "Se detectaron **1,240 usuarios** con alto riesgo de abandono:\n\n• Última actividad: hace más de 21 días\n• Ciudad principal: Medellín (68%)\n• Perfil: usuarios sin reserva completada\n• Recomendación: campaña de reactivación con descuento del 15% en primera reserva.\n\n¿Quieres que cree la campaña automáticamente?",
    "campaña": "Rendimiento comparativo de campañas activas:\n\n🥇 **Sabor Bogotá** — CTR 4.82%, 2,180 conversiones\n🥈 **Viernes Parcheados** — CTR 4.37%, 1,240 conversiones\n\nLa campaña más exitosa históricamente fue **Brunch de Domingo** con CTR 5.51% y 3,420 conversiones. Recomiendo reactivarla este mes.",
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, text: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const key = Object.keys(mockResponses).find(k => input.toLowerCase().includes(k));
      const reply = key ? mockResponses[key] : "Analizando datos de la plataforma... He encontrado información relevante. Basándome en las métricas actuales, Bogotá lidera con un 58% de los ingresos y se proyecta un incremento del 18% en reservas este fin de semana. ¿Deseas un análisis más detallado?";
      setMessages(m => [...m, { role: "assistant" as const, text: reply }]);
      setLoading(false);
    }, 1200);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="space-y-5">
      <SectionHeader title="Centro de IA" sub="Insights automáticos, predicciones y asistente inteligente" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-2">
        {aiInsights.map((ins, i) => (
          <Card key={i} className="p-4 flex items-start gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${ins.color.split(" ").slice(1).join(" ")}`}>
              <ins.icon size={15} className={ins.color.split(" ")[0]} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-gray-900 mb-0.5">{ins.title}</div>
              <div className="text-[12px] text-gray-500 leading-relaxed">{ins.text}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col" style={{ height: "460px" }}>
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
            <Brain size={15} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-gray-900">Asistente Parchemos IA</div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> En línea</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 mt-0.5" style={{ background: ACCENT }}>
                  <Brain size={13} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "text-white rounded-br-md"
                    : "bg-gray-50 text-gray-800 rounded-bl-md border border-gray-100"
                }`}
                style={msg.role === "user" ? { background: ACCENT } : {}}
              >
                {msg.text.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-1" : ""}>
                    {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center mr-2 flex-shrink-0" style={{ background: ACCENT }}>
                <Brain size={13} className="text-white" />
              </div>
              <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-5 pb-4 space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-[11px] px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg hover:bg-[#FFF1EB] hover:text-[#FF6B35] border border-gray-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Pregunta algo sobre la plataforma..."
              className="flex-1 px-4 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]/50"
            />
            <button
              onClick={send}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 active:scale-95"
              style={{ background: ACCENT }}
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Navigation ────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "restaurants", label: "Restaurantes", icon: Store },
  { id: "moderation", label: "Moderación", icon: Shield },
  { id: "analytics", label: "Analítica", icon: BarChart3 },
  { id: "finances", label: "Finanzas", icon: CreditCard },
  { id: "support", label: "Soporte", icon: Headphones },
  { id: "verification", label: "Verificación", icon: BadgeCheck },
  { id: "campaigns", label: "Campañas", icon: Megaphone },
  { id: "settings", label: "Configuración", icon: Settings },
  { id: "ai", label: "Centro de IA", icon: Brain },
];

const NAV_BADGES: Record<string, string> = {
  moderation: "8",
  support: "24",
  verification: "3",
};

// ─── Sidebar ───────────────────────────────────────────────────

function Sidebar({
  view, setView, collapsed, setCollapsed,
}: {
  view: string; setView: (v: string) => void; collapsed: boolean; setCollapsed: (c: boolean) => void;
}) {
  return (
    <aside
      className={`flex flex-col border-r border-gray-100 bg-white transition-all duration-300 flex-shrink-0 ${collapsed ? "w-16" : "w-56"}`}
      style={{ height: "100vh" }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-gray-50 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: ACCENT }}>
          <span className="text-white font-bold text-[12px]">P</span>
        </div>
        {!collapsed && (
          <div>
            <div className="text-[13px] font-bold text-gray-900 leading-none">Parchemos</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Console</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] transition-all ${
                active
                  ? "bg-[#FFF1EB] text-[#FF6B35] font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={16} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {NAV_BADGES[item.id] && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${active ? "bg-[#FF6B35] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {NAV_BADGES[item.id]}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-gray-50 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <ChevronLeft size={14} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && <span className="text-[12px]">Colapsar</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-gray-600">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-gray-800 truncate">Admin</div>
              <div className="text-[10px] text-gray-400 truncate">admin@parchemos.co</div>
            </div>
            <LogOut size={13} className="text-gray-300 hover:text-gray-500 cursor-pointer" />
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Header ────────────────────────────────────────────────────

function Header({ view }: { view: string }) {
  const item = NAV_ITEMS.find(n => n.id === view);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h1 className="text-[15px] font-semibold text-gray-900">{item?.label || "Dashboard"}</h1>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Buscar en consola..."
          className="pl-8 pr-4 py-2 text-[12px] bg-gray-50 border border-gray-100 rounded-xl w-52 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:bg-white transition-colors"
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors relative"
        >
          <Bell size={16} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: ACCENT }} />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-gray-900">Notificaciones</span>
              <span className="text-[11px]" style={{ color: ACCENT }}>3 nuevas</span>
            </div>
            {alerts.map((a, i) => (
              <div key={i} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${STATUS_COLORS[a.level]?.split(" ")[0]}`}>
                <p className="text-[12px] text-gray-700">{a.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">hace {i + 1} hora{i > 0 ? "s" : ""}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF8559] flex items-center justify-center cursor-pointer">
        <span className="text-white font-bold text-[12px]">A</span>
      </div>
    </header>
  );
}

// ─── App ───────────────────────────────────────────────────────

const VIEWS: Record<string, React.FC> = {
  dashboard: DashboardView,
  users: UsersView,
  restaurants: RestaurantsView,
  moderation: ModerationView,
  analytics: AnalyticsView,
  finances: FinancesView,
  support: SupportView,
  verification: VerificationView,
  campaigns: CampaignsView,
  settings: SettingsView,
  ai: AICenterView,
};

export default function App() {
  const [view, setView] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const ViewComponent = VIEWS[view] || DashboardView;

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-[Inter,sans-serif] overflow-hidden">
      <Sidebar view={view} setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header view={view} />
        <main className="flex-1 overflow-y-auto p-6">
          <ViewComponent />
        </main>
      </div>
    </div>
  );
}
