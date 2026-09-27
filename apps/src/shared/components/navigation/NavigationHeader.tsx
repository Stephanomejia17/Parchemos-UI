import type { ReactNode } from "react";
import { DesktopHeader } from "@/shared/components/DesktopHeader";
import type { BreadcrumbItem } from "@/shared/navigation/types";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useOrder } from "@/shared/context/order-context";

export function NavigationHeader({
  breadcrumbs,
  backHref,
  avatar,
  showCart = false,
}: {
  breadcrumbs: BreadcrumbItem[];
  backHref?: string;
  avatar?: ReactNode;
  showCart?: boolean;
}) {
  return (
    <DesktopHeader
      breadcrumbs={breadcrumbs}
      backHref={backHref}
      avatar={avatar ?? <span className="h-8 w-8 rounded-xl bg-primary" />}
      cart={showCart ? <CustomerCartButton /> : undefined}
    />
  );
}

function CustomerCartButton() {
  const { totalItems } = useOrder();
  return (
    <Link
      href="/order-summary"
      aria-label={`Ver carrito${totalItems > 0 ? `, ${totalItems} productos` : ""}`}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
    >
      <ShoppingCart className="h-4 w-4" />
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
