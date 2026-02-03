import Image from "next/image";
import BeforeAfter from "./components/BeforeAfter";
import Header from "./components/Header";
import ServiceMapClient from "./components/ServiceMapClient";

const packs = [
  {
    name: "Pack Essentiel",
    tagline: "Idéal pour un entretien régulier et un véhicule propre au quotidien.",
    items: [
      "Aspiration intérieure légère",
      "Lavage extérieur complet à la main",
      "Nettoyage des jantes et pneus",
      "Séchage manuel",
      "Vitres intérieures et extérieures",
    ],
    duration: "Durée indicative : 1h – 1h30",
    note: "Recommandé pour un entretien mensuel ou bimensuel.",
    image: "/images/detail-microfiber.jpg",
  },
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
    image: "/images/interior-leather.jpg",
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
    image: "/images/pexels-fbo-media.jpg",
  },
];

const gallery = [
  { src: "/images/gallery-1.jpg", alt: "Voiture noire haut de gamme" },
  { src: "/images/gallery-2.jpg", alt: "Coupé noir en ville" },
  { src: "/images/after-clean.jpg", alt: "Carrosserie brillante après detailing" },
  { src: "/images/interior-leather.jpg", alt: "Intérieur cuir élégant" },
];

const why = [
  "Service mobile premium",
  "Produits professionnels",
  "Résultat durable",
  "Approche personnalisée",
];

const testimonials = [
  {
    quote: "Intérieur impeccable, plus aucune poussière. Service au top.",
    name: "Julie M.",
  },
  {
    quote: "Pack Premium idéal avant une revente. Résultat bluffant.",
    name: "Marc D.",
  },
  {
    quote: "Travail minutieux, ponctuel, très pro. Je recommande.",
    name: "Sarah L.",
  },
  {
    quote: "Voiture comme neuve. Finitions parfaites.",
    name: "Thomas R.",
  },
];

export default function Home() {
  return (
    <div className="page">
      <Header />

      <main>
        <section className="hero" id="top">
          <div className="hero-media">
            <video
              className="hero-video"
              src="/images/videobg.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/images/hero-pexels.jpg"
            />
          </div>
          <div className="container hero-content">
            <div className="fade-up">
              <p className="eyebrow">Detailing automobile premium</p>
              <h1 className="hero-title">Redonner l'éclat d'origine</h1>
              <p className="hero-text">
                Un soin précis et professionnel pour sublimer chaque détail de
                votre véhicule.
              </p>
              <div className="hero-actions">
                <button className="btn" type="button">
                  Prendre rendez-vous
                </button>
                <a className="btn btn-ghost" href="#packs">
                  Voir les packs
                </a>
              </div>
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
                Chaque intervention est réalisée avec des produits professionnels
                et des méthodes maîtrisées, pour un résultat immédiatement
                visible et durable.
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
            <p className="eyebrow">Nos prestations</p>
            <h2 className="section-title">Packs detailing</h2>
            <p className="section-subtitle">
              Trois niveaux d'intervention pour répondre à chaque besoin,
              du maintien régulier au traitement complet premium.
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
                    <div className="pack-meta">{pack.duration}</div>
                    <div className="pack-meta">{pack.note}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="avant-apres">
          <div className="container ba-section">
            <div>
              <p className="eyebrow">Résultat</p>
              <h2 className="section-title">Avant / Après</h2>
              <p className="section-subtitle">
                Le résultat parle de lui-même. Faites glisser pour comparer.
              </p>
            </div>
            <BeforeAfter />
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

        <section className="section" id="temoignages">
          <div className="container">
            <p className="eyebrow">Ils nous font confiance</p>
            <h2 className="section-title">Témoignages</h2>
            <p className="section-subtitle">
              Des clients satisfaits par la précision, la discrétion et la
              qualité du résultat.
            </p>
            <div className="testimonials-grid">
              {testimonials.map((item) => (
                <div key={item.name} className="testimonial-card">
                  <strong>★★★★★</strong>
                  <p>{item.quote}</p>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="zone">
          <div className="container">
            <p className="eyebrow">Zone d'intervention</p>
            <h2 className="section-title">Liège & alentours</h2>
            <p className="section-subtitle">
              Nous intervenons dans un rayon de 20 km autour de Liège.
            </p>
            <div style={{ height: 20 }} />
            <ServiceMapClient />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand">LN AUTOSHINE</div>
            <small>Detailing automobile haut de gamme à domicile.</small>
          </div>
          <div>
            <strong>Contact</strong>
            <small>+32 XX XXX XX XX</small>
            <small>contact@lnautoshine.be</small>
          </div>
          <div>
            <strong>Zone</strong>
            <small>Liège, Belgique</small>
            <small>Rayon 30 km</small>
          </div>
          <div>
            <strong>Réseaux</strong>
            <small>Instagram (placeholder)</small>
            <small>Facebook (placeholder)</small>
          </div>
        </div>
      </footer>
    </div>
  );
}
