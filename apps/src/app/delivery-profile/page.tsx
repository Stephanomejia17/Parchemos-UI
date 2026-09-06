import { RequireAuth } from "@/shared/auth";
import { Profile } from "@/modules/account/Profile";

export default function DeliveryProfilePage() {
  return (
    <RequireAuth loginPath="/login" allowedRoles={["repartidor"]}>
      <Profile />
    </RequireAuth>
  );
}
