export const siteUrl = "https://lnautoshine.be";

export const siteName = "LN AutoShine";

export const siteDescription =
  "Detailing automobile premium à domicile autour d'Amay, Liège et Huy : lavage main, nettoyage intérieur et extérieur, shampoing sièges et finitions haut de gamme.";

export const serviceAreas = ["Amay", "Liège", "Huy", "Engis", "Flémalle", "Seraing"];

export const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${siteUrl}/#business`,
  name: siteName,
  url: siteUrl,
  image: `${siteUrl}/images/pexels-lynxexotics.jpg`,
  description: siteDescription,
  telephone: "+32493084331",
  email: "lnautoshine@gmail.com",
  priceRange: "€€",
  areaServed: serviceAreas.map((area) => ({
    "@type": "City",
    name: area,
  })),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Amay",
    addressCountry: "BE",
  },
  sameAs: [
    "https://www.instagram.com/ln_autoshine/",
    "https://linktr.ee/lnautoshine",
  ],
  makesOffer: [
    {
      "@type": "Offer",
      name: "Pack Essentiel",
      price: "65",
      priceCurrency: "EUR",
      itemOffered: {
        "@type": "Service",
        name: "Nettoyage voiture à domicile",
      },
    },
    {
      "@type": "Offer",
      name: "Pack Confort",
      price: "99",
      priceCurrency: "EUR",
      itemOffered: {
        "@type": "Service",
        name: "Nettoyage intérieur extérieur voiture",
      },
    },
    {
      "@type": "Offer",
      name: "Pack Premium",
      price: "145",
      priceCurrency: "EUR",
      itemOffered: {
        "@type": "Service",
        name: "Detailing automobile premium",
      },
    },
  ],
};
