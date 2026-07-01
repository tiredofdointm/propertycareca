import Link from "next/link";

const links = [
  { href: "/services", label: "Services" },
  { href: "/plans", label: "Plans" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Get an Estimate" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-dark">
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-brand" />
          PropertyCare<span className="text-accent">CA</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/80 sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-brand-dark">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/booking"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Book a Service
          </Link>
        </div>
      </div>
    </header>
  );
}
