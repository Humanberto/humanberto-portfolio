import { Suspense } from "react";
import MyOfficeLoginPage from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center text-white/60">Loading…</div>}>
      <MyOfficeLoginPage />
    </Suspense>
  );
}
