"use client";

import { RequireAuth } from "@parchemos/shared/auth";
import { MenuManagement } from "@/features/profile/dashboard/MenuManagement";

export function RestaurantMenuConfiguration({ restaurantId }: { restaurantId: string }) {
  return <RequireAuth loginPath="/login" allowedRoles={["restaurante"]}><Configuration restaurantId={restaurantId} /></RequireAuth>;
}

function Configuration({ restaurantId }: { restaurantId: string }) {
  return <main className="min-h-full overflow-y-auto bg-gray-50 px-4 py-6"><div className="mx-auto max-w-5xl"><MenuManagement restaurantId={restaurantId} /></div></main>;
}
