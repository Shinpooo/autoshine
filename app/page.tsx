import Image from "next/image";
import Header from "./components/Header";
import ServiceMapClient from "./components/ServiceMapClient";
import BeforeAfter from "./components/BeforeAfter";
import TestimonialsSection from "./components/TestimonialsSection";
import BookingDrawer from "./components/BookingDrawer";
import HeroVideo from "./components/HeroVideo";
import MobileStickyCta from "./components/MobileStickyCta";
import WhatsAppIcon from "./components/WhatsAppIcon";
import { businessJsonLd } from "./seo";

// The Google review data must be requested at runtime rather than frozen at build time.
export const dynamic = "force-dynamic";

const packs = [
  {
    name: "Pack Confort",
    tagline: "Nettoyage complet pour retrouver un intérieur et un extérieur soignés.",
    items: [
      "Aspiration intérieure complète",
      "Nettoyage des plastiques intérieurs",
      "Lavage extérieur complet à la main",
      "Vitres intérieures et extérieures",
      "Désinfection légère de l'habitacle",
      "Parfum intérieur",
      "Traitement lustrant carrosserie",
    ],
    duration: "Durée indicative : 2h – 2h30",
    note: "Le meilleur équilibre entre résultat et budget.",
    price: "À partir de 110 €",
    image: "/images/detail-microfiber.jpg",
  },
  {
    name: "Pack Premium",
    tagline: "Remise en état approfondie et finitions haut de gamme.",
    items: [
      "Toutes les prestations du Pack Confort",
      "Shampoing des sièges et tapis",
      "Nettoyage approfondi des plastiques",
      "Aération complète de l'habitacle",
      "Traitement protecteur plastiques ou cuir",
    ],
    duration: "Durée indicative : 3h – 4h",
    note: "Idéal avant une vente ou après une période sans entretien.",
    price: "À partir de 165 €",
    image: "/images/interior-leather.jpg",
  },
  {
    name: "Pack Detailing",
    tagline:
      "Nettoyage intérieur en profondeur pour redonner à l'habitacle un aspect neuf.",
    items: [
      "Toutes les prestations du Pack Premium",
      "Shampoing intégral sièges, tapis et coffre",
      "Nettoyage détaillé des moindres recoins (aérations, contours, plastiques)",
      "Traitement anti-odeurs",
      "Protection cuir ou textile selon matière",
    ],
    duration: "Durée indicative : 4h – 6h",
    note:
      "Idéal pour un intérieur très sale, une remise à neuf avant vente, ou un entretien annuel poussé.",
    price: "À partir de 299 €",
    image: "/images/pexels-fbo-media.jpg",
  },
];

const whatsappHref = `https://wa.me/32493084331?text=${encodeURIComponent(
  "Bonjour LN AutoShine, j'aimerais avoir des informations pour un detailing automobile à domicile."
)}`;

export default function Home() {
  return (
    <div className="page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
      />
      <Header />

      <main>
        <section className="hero" id="top">
          <div className="hero-media">
            <HeroVideo />
          </div>
          <div className="container hero-content">
            <div className="fade-up">
              <p className="eyebrow hide-mobile">Detailing automobile à domicile</p>
              <h1 className="hero-title">
                Detailing automobile à domicile à Huy et alentours
              </h1>
              <p className="hero-text">
                Nettoyage intérieur et extérieur, lavage à la main et finitions
                premium pour sublimer chaque détail de votre véhicule.
              </p>
              <div className="hero-actions">
                <button className="btn" type="button" data-open-booking data-hero-booking-cta>
                  Voir les disponibilités
                </button>
                <a className="btn btn-ghost" href="#avant-apres">
                  Voir l&apos;avant / après
                </a>
                <a
                  className="btn btn-ghost btn-whatsapp hero-whatsapp"
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Contacter LN AutoShine sur WhatsApp"
                >
                  <WhatsAppIcon />
                </a>
              </div>
              <p className="cta-microcopy">
                Réservation en 2 minutes · 20 km inclus autour de Huy
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="avant-apres">
          <div className="container ba-section">
            <div className="ba-heading">
              <p className="eyebrow">Résultat</p>
              <h2 className="section-title">Avant / Après</h2>
              <p className="section-subtitle">
                Le résultat parle de lui-même. Faites glisser pour comparer.
              </p>
            </div>
            <div className="ba-grid">
              <article className="ba-case">
                <p className="ba-case__title">BMW Série 3 Touring</p>
                <BeforeAfter
                  beforeSrc="/images/before-after-bmw-before.webp"
                  afterSrc="/images/before-after-bmw-after.webp"
                  vehicle="BMW Série 3 Touring"
                />
              </article>
              <article className="ba-case">
                <p className="ba-case__title">Porsche Macan</p>
                <BeforeAfter
                  beforeSrc="/images/before-after-porsche-before.webp"
                  afterSrc="/images/before-after-porsche-after.webp"
                  vehicle="Porsche Macan"
                />
              </article>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container promise-grid">
            <div>
              <p className="eyebrow">Notre promesse</p>
              <h2 className="section-title">
                Detailing haut de gamme, finition irréprochable
              </h2>
              <p className="section-subtitle">
                LN AutoShine se déplace à domicile dans un rayon de 20 km autour
                de Huy, puis sur confirmation avec supplément kilométrique, pour
                nettoyer, protéger et valoriser votre véhicule.
              </p>
            </div>
            <div className="promise-media">
              <Image
                src="/images/pexels-lynxexotics.jpg"
                alt="Microfibre sur carrosserie"
                fill
                sizes="(max-width: 900px) 100vw, 520px"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </section>

        <section className="section" id="packs">
          <div className="container">
            <p className="eyebrow">Nos Packs</p>
            <h2 className="section-title">Nos Prestations</h2>
            <p className="section-subtitle">
              Trois niveaux d&apos;intervention pour répondre à chaque besoin :
              entretien régulier, nettoyage intérieur extérieur complet ou
              remise en état premium avant une vente.
            </p>
            <div className="packs-grid">
              {packs.map((pack) => (
                <article key={pack.name} className="pack-card">
                  <div className="pack-media">
                    <Image
                      src={pack.image}
                      alt={pack.name}
                      fill
                      sizes="(max-width: 900px) 100vw, 400px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="pack-body">
                    <div>
                      <h3>{pack.name}</h3>
                      <p className="section-subtitle">{pack.tagline}</p>
                    </div>
                    <ul>
                      {pack.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <div className="pack-price">{pack.price}</div>
                    <div className="pack-meta">{pack.duration}</div>
                    <div className="pack-meta">{pack.note}</div>
                    <button
                      className="btn pack-cta"
                      type="button"
                      data-open-booking
                      data-booking-pack={pack.name}
                    >
                      Choisir le {pack.name}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <p className="packs-pricing-note">
              Tarifs TTC selon le gabarit du véhicule. Le prix de base exact
              s&apos;affiche pendant la réservation.
            </p>
            <details className="pricing-extras">
              <summary>Voir les options et suppléments</summary>
              <div className="pricing-extras-grid">
                <div>
                  <h3>Options ciblées</h3>
                  <ul>
                    <li>Shampoing ciblé, en complément du Pack Confort : 25 € / siège</li>
                    <li>Traitement du cuir, lorsqu&apos;il n&apos;est pas inclus : à partir de 30 €</li>
                    <li>Restauration des plastiques extérieurs : à partir de 30 €</li>
                    <li>Décontamination carrosserie à la barre d&apos;argile : à partir de 40 €</li>
                    <li>Vapeur de la zone de chargement : 20 à 35 €</li>
                  </ul>
                </div>
                <div>
                  <h3>État et déplacement</h3>
                  <ul>
                    <li>Poils d&apos;animaux : 15 à 25 €, estimés sur photos</li>
                    <li>Véhicule très sale : estimation préalable sur photos</li>
                    <li>20 km inclus autour de Huy, puis 1 € / km supplémentaire</li>
                  </ul>
                  <p>
                    Tout supplément est annoncé et accepté avant l&apos;intervention.
                  </p>
                </div>
              </div>
            </details>
          </div>
        </section>

        {/* <section className="section" id="realisations">
          <div className="container">
            <p className="eyebrow">Galerie</p>
            <h2 className="section-title">Nos réalisations</h2>
            <p className="section-subtitle">
              Des finitions précises, un rendu premium sur chaque véhicule.
            </p>
            <div className="gallery-grid">
              {gallery.map((item) => (
                <div key={item.src} className="gallery-item">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 320px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">Pourquoi nous</p>
            <h2 className="section-title">Pourquoi LN AutoShine ?</h2>
            <p className="section-subtitle">
              Une approche artisanale, des standards exigeants et une attention
              constante au détail.
            </p>
            <div className="why-grid">
              {why.map((item) => (
                <div key={item} className="why-card">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section> */}

        <TestimonialsSection />

        <section className="section" id="zone">
          <div className="container">
            <p className="eyebrow">Zone d&apos;intervention</p>
            <h2 className="section-title">Huy & alentours</h2>
            <p className="section-subtitle zone-subtitle-one-line">
              20 km inclus autour de Huy : Wanze, Amay, Andenne, Engis et Villers-le-Bouillet.
              Au-delà, comptez 1 € par kilomètre supplémentaire après confirmation.
            </p>
            <div style={{ height: 20 }} />
            <ServiceMapClient />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-main">
            <div className="footer-brand-block">
              <div className="footer-brand" aria-label="LN AutoShine">
                <Image
                  className="footer-logo"
                  src="/images/logo-transparent.png"
                  alt="LN AutoShine"
                  width={2172}
                  height={724}
                  sizes="(max-width: 700px) 150px, 172px"
                />
              </div>
              <p>
                Detailing automobile haut de gamme à domicile, avec une finition
                propre, durable et soignée.
              </p>
            </div>

            <div className="footer-column">
              <strong>Contact</strong>
              <a href="tel:+32493084331">+32 493 08 43 31</a>
              <a href="mailto:contact@lnautoshine.be">contact@lnautoshine.be</a>
            </div>

            <div className="footer-column">
              <strong>Zone</strong>
              <span>Huy et alentours</span>
              <span>20 km inclus autour de Huy</span>
            </div>

            <div className="footer-column">
              <strong>Réseaux</strong>
              <a href="https://www.instagram.com/ln_autoshine/" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href="https://linktr.ee/lnautoshine" target="_blank" rel="noreferrer">
                Linktree
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <small>© 2026 LN AutoShine</small>
            <small>Nettoyage intérieur et extérieur à domicile</small>
          </div>
        </div>
      </footer>

      <MobileStickyCta whatsappHref={whatsappHref} />

      <BookingDrawer />
    </div>
  );
}
