import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  );
  if (session) {
    redirect("/admin/leads");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Admin Sign In</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Staff access only.
      </p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
