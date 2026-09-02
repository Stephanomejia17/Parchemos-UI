import { RequireAuth } from "@parchemos/shared/auth";
import { Restaurants } from "@/features/admin/restaurants/Restaurants";

export default function AdminRestaurantsPage() {
  return <RequireAuth loginPath="/login" allowedRoles={["administrador"]}><Restaurants /></RequireAuth>;
}