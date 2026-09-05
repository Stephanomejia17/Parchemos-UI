import type { ReactNode } from "react";
import { RestaurantShell } from "./_components/RestaurantShell";

export default function RestaurantLayout({ children }: { children: ReactNode }) {
  return <RestaurantShell>{children}</RestaurantShell>;
}
