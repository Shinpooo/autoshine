import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LN AutoShine | Detailing automobile haut de gamme à domicile",
  description:
    "LN AutoShine propose un detailing automobile premium à domicile à Liège et alentours. Packs Essentiel, Confort et Premium, finitions soignées et résultat durable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
