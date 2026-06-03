import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Perfume Decant Price Calculator",
  description: "Calculate profitable perfume decant prices instantly.",
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
