import Link from "next/link";
import { services } from "@/lib/services-data";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-brand-light">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-brand-dark">
            PropertyCare<span className="text-accent">CA</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-foreground/70">
            Dependable property maintenance for homes, rentals, and
            businesses across California, every season of the year.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-dark">Services</p>
          <ul className="mt-3 space-y-2 text-sm text-foreground/70">
            {services.slice(0, 5).map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="hover:text-brand-dark"
                >
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-dark">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-foreground/70">
            <li>
              <Link href="/about" className="hover:text-brand-dark">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/plans" className="hover:text-brand-dark">
                Plans
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-dark">
                Get an Estimate
              </Link>
            </li>
            <li>
              <Link href="/booking" className="hover:text-brand-dark">
                Book a Service
              </Link>
            </li>
            <li>
              <a href="tel:+18005550142" className="hover:text-brand-dark">
                1-800-555-0142
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 py-4 text-center text-xs text-foreground/50">
        &copy; {`${new Date().getFullYear()} `}PropertyCareCA &mdash;
        propertycareca.com. All rights reserved.
      </div>
    </footer>
  );
}
