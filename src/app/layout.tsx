import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { BRAND_MARK, BRAND_NAME, BRAND_OG_IMAGE } from "@/lib/brand";
import { absoluteUrl, getSiteUrl } from "@/lib/utils";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const ogImage = {
  url: absoluteUrl(BRAND_OG_IMAGE),
  width: 1200,
  height: 1200,
  alt: BRAND_NAME,
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${BRAND_NAME} — Foto və Video Avadanlıq Kirayəsi`,
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    "Bakıda peşəkar kamera, linza, işıq və stabilizator kirayəsi. WhatsApp ilə sürətli rezervasiya.",
  icons: {
    icon: [{ url: BRAND_MARK, type: "image/png" }],
    apple: [{ url: BRAND_MARK }],
  },
  openGraph: {
    type: "website",
    locale: "az_AZ",
    siteName: BRAND_NAME,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [absoluteUrl(BRAND_OG_IMAGE)],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-bg text-fg antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
