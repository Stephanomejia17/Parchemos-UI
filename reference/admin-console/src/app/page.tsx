import { redirect } from "next/navigation";

export default function RootPage() {
  // El guard de ConsoleShell decide: con sesión se queda en el dashboard,
  // sin sesión rebota al login.
  redirect("/dashboard");
}
