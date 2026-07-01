import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = await verifySessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin/leads" className="text-lg font-bold text-brand-dark">
            PropertyCare Admin
          </Link>
          {session ? (
            <nav className="flex items-center gap-6 text-sm font-medium text-foreground/80">
              <Link href="/admin/leads" className="hover:text-brand-dark">
                Leads
              </Link>
              <Link href="/admin/bookings" className="hover:text-brand-dark">
                Bookings
              </Link>
              <Link href="/admin/campaigns" className="hover:text-brand-dark">
                Campaigns
              </Link>
              <LogoutButton />
            </nav>
          ) : null}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
