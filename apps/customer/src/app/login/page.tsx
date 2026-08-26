import { Suspense } from "react";
import { Login } from "@/features/login/Login";

export default function LoginPage() {
  // useSearchParams (el aviso de "cuenta creada") necesita una frontera de Suspense.
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
