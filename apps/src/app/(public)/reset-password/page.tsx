import { Suspense } from "react";
import { ResetPassword } from "@/modules/auth/password-recovery/ResetPassword";

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPassword /></Suspense>;
}
