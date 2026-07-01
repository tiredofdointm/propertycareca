import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://propertycareca.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "PropertyCareCA | Property Maintenance & Real Estate Services in California",
    template: "%s | PropertyCareCA",
  },
  description:
    "Property maintenance for California homes, rentals, and businesses: lawn care, gutter cleaning, pressure washing, handyman repairs, construction cleanup, and seasonal upkeep. Free custom estimates for homeowners, landlords, realtors, and property managers.",
  keywords: [
    "property maintenance California",
    "real estate services",
    "property management support",
    "construction cleanup",
    "handyman services",
    "lawn care",
    "gutter cleaning",
    "pressure washing",
    "rental property maintenance",
    "property care",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "PropertyCareCA",
    title:
      "PropertyCareCA | Property Maintenance & Real Estate Services in California",
    description:
      "One dependable crew for everything your property needs — maintenance, repairs, and upkeep for homes, rentals, and commercial real estate across California.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PropertyCareCA | Property Maintenance in California",
    description:
      "Free custom estimates for property maintenance, repairs, and real-estate support services across California.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
