// Mock data reused por más de una feature (p. ej. el Header lee las mismas alertas que el Dashboard).

export const ordersData = [
  { day: "Lun", orders: 342, revenue: 4820 },
  { day: "Mar", orders: 418, revenue: 6240 },
  { day: "Mié", orders: 389, revenue: 5680 },
  { day: "Jue", orders: 445, revenue: 7120 },
  { day: "Vie", orders: 612, revenue: 9840 },
  { day: "Sáb", orders: 724, revenue: 11200 },
  { day: "Dom", orders: 538, revenue: 8340 },
];

export const cityRevData = [
  { city: "Bogotá", revenue: 142, orders: 1840 },
  { city: "Medellín", revenue: 98, orders: 1220 },
  { city: "Cali", revenue: 61, orders: 780 },
  { city: "Cartagena", revenue: 38, orders: 420 },
  { city: "Barranquilla", revenue: 28, orders: 310 },
];

export const alerts = [
  { level: "critical", message: "3 restaurantes con pagos pendientes superiores a 30 días", action: "Revisar" },
  { level: "warning", message: "Spike de errores en gateway Bancolombia (+340%)", action: "Ver logs" },
  { level: "info", message: "Campaña 'Viernes Parcheados' termina en 48 horas", action: "Gestionar" },
];
