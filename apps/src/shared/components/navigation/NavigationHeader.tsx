import type { ReactNode } from "react";
import { DesktopHeader } from "@/shared/components/DesktopHeader";
import type { BreadcrumbItem } from "@/shared/navigation/types";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { useOrder } from "@/shared/context/order-context";
import { BrandLogo } from "@/shared/components/BrandLogo";

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
    <>
      <DesktopHeader
        breadcrumbs={breadcrumbs}
        backHref={backHref}
        avatar={avatar ?? <BrandLogo className="h-8 w-8 rounded-xl" />}
        cart={showCart ? <CustomerCartButton /> : undefined}
      />
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-4 md:hidden">
        {backHref ? (
          <Link href={backHref} aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : null}
        <nav aria-label="Breadcrumb" className="min-w-0 truncate text-sm">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className={index === breadcrumbs.length - 1 ? "font-bold text-gray-900" : "text-gray-500"}>
              {index > 0 ? " / " : ""}
              {index < breadcrumbs.length - 1 && crumb.href ? (
                <Link href={crumb.href} className="hover:text-primary">
                  {crumb.label}
                </Link>
              ) : (
                crumb.label
              )}
            </span>
          ))}
        </nav>
        {showCart ? <div className="ml-auto"><CustomerCartButton /></div> : null}
      </header>
    </>
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
