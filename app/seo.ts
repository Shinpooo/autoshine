export const siteUrl = "https://lnautoshine.be";

export const siteName = "LN AutoShine";

export const siteDescription =
  "Detailing automobile premium à domicile dans un rayon de 20 km autour de Huy : lavage main, nettoyage intérieur et extérieur, shampoing sièges et finitions haut de gamme.";

export const serviceAreas = [
  "Huy",
  "Wanze",
  "Amay",
  "Andenne",
  "Engis",
  "Villers-le-Bouillet",
];

export const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${siteUrl}/#business`,
  name: siteName,
  url: siteUrl,
  image: `${siteUrl}/images/pexels-lynxexotics.jpg`,
  description: siteDescription,
  telephone: "+32493084331",
  email: "contact@lnautoshine.be",
  priceRange: "€€",
  areaServed: serviceAreas.map((area) => ({
    "@type": "City",
    name: area,
  })),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Huy",
    addressCountry: "BE",
  },
  sameAs: [
    "https://www.instagram.com/ln_autoshine/",
    "https://linktr.ee/lnautoshine",
  ],
  makesOffer: [
    {
      "@type": "Offer",
      name: "Pack Confort",
      price: "110",
      priceCurrency: "EUR",
      itemOffered: {
        "@type": "Service",
        name: "Nettoyage intérieur extérieur voiture",
      },
    },
    {
      "@type": "Offer",
      name: "Pack Premium",
      price: "165",
      priceCurrency: "EUR",
      itemOffered: {
        "@type": "Service",
        name: "Detailing automobile premium",
      },
    },
    {
      "@type": "Offer",
      name: "Pack Detailing",
      price: "299",
      priceCurrency: "EUR",
      itemOffered: {
        "@type": "Service",
        name: "Nettoyage intérieur automobile en profondeur",
      },
    },
  ],
};
