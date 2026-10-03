import { MenuScreen } from "@/modules/customer/menu/MenuScreen";
import { getMenu } from "@/lib/api/menu";

type MenuPageProps = {
  searchParams: Promise<{ locationId?: string | string[] }>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const locationId = Array.isArray(params.locationId) ? params.locationId[0] : params.locationId;

  if (!locationId) return <p className="p-8 text-center text-muted-foreground">Selecciona una sede para ver su menú.</p>;

  try {
    return <MenuScreen dishes={await getMenu(locationId)} />;
  } catch {
    return <MenuScreen dishes={[]} loadError />;
  }
}
