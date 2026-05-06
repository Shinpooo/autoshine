import type { Metadata } from "next";
import "./globals.css";
import StartupLoader from "./components/StartupLoader";
import { siteDescription, siteName, siteUrl } from "./seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Detailing automobile à domicile à Huy et alentours | LN AutoShine",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  keywords: [
    "detailing automobile Huy",
    "nettoyage voiture à domicile Huy",
    "lavage voiture à domicile Huy",
    "nettoyage voiture à domicile Amay",
    "lavage voiture à domicile Wanze",
    "nettoyage intérieur voiture",
    "detailing auto Belgique",
    "LN AutoShine",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Detailing automobile à domicile à Huy et alentours",
    description: siteDescription,
    url: "/",
    siteName,
    locale: "fr_BE",
    type: "website",
    images: [
      {
        url: "/images/pexels-lynxexotics.jpg",
        alt: "LN AutoShine - detailing automobile à domicile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Detailing automobile à domicile à Huy et alentours",
    description: siteDescription,
    images: ["/images/pexels-lynxexotics.jpg"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning>
        <StartupLoader />
        {children}
      </body>
    </html>
  );
}
