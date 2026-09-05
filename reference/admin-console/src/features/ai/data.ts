import { AlertCircle, MapPin, TrendingUp, Zap } from "lucide-react";

const ACCENT = "#FF6B35";

export type ChatMessage = { role: "assistant" | "user"; text: string };

export const aiMessages: ChatMessage[] = [
  {
    role: "assistant",
    text: "Hola, soy el asistente de Parchemos Console. Puedo responder preguntas sobre usuarios, restaurantes, ingresos, campañas y más. ¿En qué te puedo ayudar hoy?",
  },
];

export const aiInsights = [
  { icon: TrendingUp, color: "text-emerald-600 bg-emerald-50", title: "Restaurantes en crecimiento", text: "Sushi Nagoya y Carmen lideran con +34% y +28% en reservas vs. el mes anterior." },
  { icon: AlertCircle, color: "text-amber-600 bg-amber-50", title: "Riesgo de abandono", text: "1,240 usuarios en Medellín sin actividad hace más de 21 días. Considera una campaña de reactivación." },
  { icon: MapPin, color: "text-blue-600 bg-blue-50", title: "Ciudad más rentable", text: "Bogotá generó el 58% de los ingresos del mes. Chapinero es la zona con mayor densidad de pedidos." },
  { icon: Zap, color: `text-[${ACCENT}] bg-[#FFF1EB]`, title: "Predicción fin de semana", text: "Se proyecta un incremento del 18% en reservas este sábado entre 7–10 PM." },
];

export const AI_SUGGESTIONS = [
  "¿Qué restaurantes están creciendo más?",
  "¿Qué ciudades generan más ingresos?",
  "¿Qué usuarios tienen riesgo de abandono?",
  "¿Cuál campaña tuvo mejor rendimiento?",
];

export const AI_MOCK_RESPONSES: Record<string, string> = {
  restaurantes:
    "Los 3 restaurantes con mayor crecimiento en agosto son:\n\n• **Sushi Nagoya** — +34% en reservas, +28% en pedidos\n• **Carmen** — +28% en reservas, +31% en ventas\n• **Andrés Carne de Res** — +19% en ticket promedio\n\nSushi Nagoya lidera gracias a su campaña de redes publicada el 22 de julio.",
  ciudades:
    "Análisis de ingresos por ciudad este mes:\n\n• **Bogotá** — $142M (58% del total) · zona Chapinero lidera\n• **Medellín** — $98M (40% YoY) · El Poblado y Laureles en alza\n• **Cali** — $61M · crecimiento sostenido del 22%\n• **Cartagena** — $38M · pico en temporada de viajes\n\nBogotá concentra el 58% de los ingresos totales.",
  abandono:
    "Se detectaron **1,240 usuarios** con alto riesgo de abandono:\n\n• Última actividad: hace más de 21 días\n• Ciudad principal: Medellín (68%)\n• Perfil: usuarios sin reserva completada\n• Recomendación: campaña de reactivación con descuento del 15% en primera reserva.\n\n¿Quieres que cree la campaña automáticamente?",
  campaña:
    "Rendimiento comparativo de campañas activas:\n\n🥇 **Sabor Bogotá** — CTR 4.82%, 2,180 conversiones\n🥈 **Viernes Parcheados** — CTR 4.37%, 1,240 conversiones\n\nLa campaña más exitosa históricamente fue **Brunch de Domingo** con CTR 5.51% y 3,420 conversiones. Recomiendo reactivarla este mes.",
};

export const AI_FALLBACK_RESPONSE =
  "Analizando datos de la plataforma... He encontrado información relevante. Basándome en las métricas actuales, Bogotá lidera con un 58% de los ingresos y se proyecta un incremento del 18% en reservas este fin de semana. ¿Deseas un análisis más detallado?";
