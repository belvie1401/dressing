import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mon Dressing — Votre dressing intelligent",
  description: "Gérez votre garde-robe, créez des tenues et recevez des conseils de style personnalisés par IA.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
