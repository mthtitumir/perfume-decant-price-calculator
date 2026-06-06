import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

import { seoKeywords, siteDescription, siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "Perfume Decant Price Calculator BD | Decant Price in Bangladesh",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: seoKeywords,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "Business",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: "Perfume Decant Price Calculator BD",
    description: siteDescription,
    locale: "en_BD",
    images: [
      {
        url: "/decant.png",
        width: 1280,
        height: 1280,
        alt: "Perfume decant price calculator for Bangladesh sellers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Perfume Decant Price Calculator BD",
    description: siteDescription,
    images: ["/decant.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/decant.png",
  },
  other: {
    "image": "/decant.png",
    "msapplication-TileImage": "/decant.png",
    "theme-color": "#10b981",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background font-sans">{children}</body>
      <GoogleAnalytics gaId="G-ES1QLL948J" />
    </html>
  );
}
