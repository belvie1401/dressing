import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mon Dressing — Votre dressing intelligent",
  description: "Gérez votre garde-robe, créez des tenues et recevez des conseils de style personnalisés par IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
