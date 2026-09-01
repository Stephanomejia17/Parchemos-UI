import { Suspense } from "react";
import { ResetPassword } from "@/features/password-recovery/ResetPassword";

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPassword /></Suspense>;
}
