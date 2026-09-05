import type { ReactNode } from "react";
import { DesktopHeader } from "@/shared/components/DesktopHeader";
import type { BreadcrumbItem } from "@/shared/navigation/types";

export function NavigationHeader({
  breadcrumbs,
  backHref,
  avatar,
}: {
  breadcrumbs: BreadcrumbItem[];
  backHref?: string;
  avatar?: ReactNode;
}) {
  return (
    <DesktopHeader
      breadcrumbs={breadcrumbs}
      backHref={backHref}
      avatar={avatar ?? <span className="h-8 w-8 rounded-xl bg-primary" />}
    />
  );
}
