import { CreditCard, FileText, Globe, Key, Lock, Percent } from "lucide-react";

export const SETTINGS_SECTIONS = [
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
