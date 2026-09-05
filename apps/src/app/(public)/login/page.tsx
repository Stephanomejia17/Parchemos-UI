import { Suspense } from "react";
import { Login } from "@/modules/auth/login/Login";

export default function LoginPage() {
  // useSearchParams (el aviso de "cuenta creada") necesita una frontera de Suspense.
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
