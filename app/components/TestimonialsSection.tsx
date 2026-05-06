import Image from "next/image";
import type { CSSProperties } from "react";

type TestimonialImage = {
  src: string;
  alt: string;
};

type Testimonial = {
  quote: string;
  name: string;
  images?: TestimonialImage[];
  imageCount?: number;
};

const googleReviewSummary = {
  rating: "5,0",
  stars: "★★★★★",
  reviewCount: 12,
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Très bon boulot,(4heures sur une beetle cabriolet) personne consciencieuse et bonne conseillère. Je recommande.",
    name: "Antonio Calabrese",
  },
  {
    quote:
      "J'ai découvert le travail de LN AutoShine sur les réseaux sociaux et la qualité de leurs services m'a vraiment impressionné. Ma voiture avait besoin d'être nettoyée avant d'être rendue à son propriétaire. Je referai appel à eux sans hésiter. Service rapide, abordable et de grande qualité.",
    name: "nate williams",
  },
  {
    quote:
      "J'ai fait appel à LN AutoShine et je suis vraiment satisfait du résultat. J'ai eu plus que ce que je voulais, je ne peux que recommander",
    name: "Youssef Ouazzani",
  },
  {
    quote: "Un pro passionné n'hésitez pas a faire appel a ses services",
    name: "didier barbe",
  },
  {
    quote: "Service impeccable . Merci et à bientôt .",
    name: "ASBL Animal Sans Logis",
  },
  {
    quote: "Très sympa et efficace un travail très bien fait",
    name: "Antonino Castiglione",
    images: [
      {
        src: "/images/reviews/antonino-castiglione-1.webp",
        alt: "Photo de l'avis Google d'Antonino Castiglione",
      },
      {
        src: "/images/reviews/antonino-castiglione-2.webp",
        alt: "Photo de l'avis Google d'Antonino Castiglione",
      },
      {
        src: "/images/reviews/antonino-castiglione-3.webp",
        alt: "Photo de l'avis Google d'Antonino Castiglione",
      },
    ],
    imageCount: 3,
  },
  {
    quote:
      "Professionnels et flexibles sur les horaires de prestations. Font en sorte de trouver des compromis pour faciliter les prestations. Je suis très satisfait du nettoyage de mon VW Caddy et recommande grandement",
    name: "Noa",
    images: [
      {
        src: "/images/reviews/noa-1.webp",
        alt: "Photo de l'avis Google de Noa",
      },
      {
        src: "/images/reviews/noa-2.webp",
        alt: "Photo de l'avis Google de Noa",
      },
      {
        src: "/images/reviews/noa-3.webp",
        alt: "Photo de l'avis Google de Noa",
      },
    ],
    imageCount: 4,
  },
  {
    quote:
      "Je recommande a 100% travail de qualite!!! Tres professionnel encore merci a vous 😊 Bonne route et a bientot😉",
    name: "isabelle baccus",
    images: [
      {
        src: "/images/reviews/isabelle-baccus-1.webp",
        alt: "Photo de l'avis Google d'isabelle baccus",
      },
      {
        src: "/images/reviews/isabelle-baccus-2.webp",
        alt: "Photo de l'avis Google d'isabelle baccus",
      },
      {
        src: "/images/reviews/isabelle-baccus-3.webp",
        alt: "Photo de l'avis Google d'isabelle baccus",
      },
    ],
    imageCount: 4,
  },
];

function TestimonialPhotos({ item }: { item: Testimonial }) {
  const images = item.images;

  if (!images?.length) {
    return null;
  }

  const extraCount = Math.max((item.imageCount ?? images.length) - images.length, 0);

  return (
    <div className="testimonial-photos" aria-label={`Photos de l'avis Google de ${item.name}`}>
      {images.map((image, index) => (
        <div className="testimonial-photo-wrap" key={image.src}>
          <Image
            src={image.src}
            alt={image.alt}
            width={160}
            height={120}
            sizes="(max-width: 768px) 26vw, 120px"
            className="testimonial-photo"
          />
          {index === images.length - 1 && extraCount > 0 ? (
            <span className="testimonial-photo-more">+{extraCount}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const columns = [
    testimonials.filter((_, index) => index % 3 === 0),
    testimonials.filter((_, index) => index % 3 === 1),
    testimonials.filter((_, index) => index % 3 === 2),
  ];
  const durations = [28, 46, 28];

  return (
    <section className="section" id="temoignages">
      <div className="container">
        <p className="eyebrow">Ils nous font confiance</p>
        <div className="testimonials-heading">
          <h2 className="section-title">Avis Google</h2>
          <div
            className="google-rating-badge"
            aria-label={`Note Google : ${googleReviewSummary.rating} sur 5, ${googleReviewSummary.reviewCount} avis`}
          >
            <strong>{googleReviewSummary.rating}</strong>
            <span aria-hidden>{googleReviewSummary.stars}</span>
            <small>{googleReviewSummary.reviewCount} avis</small>
          </div>
        </div>
        <p className="section-subtitle">
          Des retours clients authentiques sur la qualité des finitions.
        </p>
        <div className="testimonials-marquee">
          {columns.map((column, columnIndex) => (
            <div className="testimonials-column" key={`col-${columnIndex}`}>
              <div
                className="testimonials-track"
                style={{ "--scroll-duration": `${durations[columnIndex]}s` } as CSSProperties}
              >
                {[...column, ...column].map((item, itemIndex) => (
                  <article
                    key={`${columnIndex}-${item.name}-${itemIndex}`}
                    className="testimonial-card"
                  >
                    <div className="testimonial-rating">★★★★★</div>
                    <p>{item.quote}</p>
                    <TestimonialPhotos item={item} />
                    <span>{item.name}</span>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="testimonials-mobile" aria-label="Avis clients">
          <div className="testimonials-mobile-track">
            {[0, 1].map((groupIndex) => (
              <div
                className="testimonials-mobile-group"
                key={`mobile-group-${groupIndex}`}
                aria-hidden={groupIndex === 1}
              >
                {testimonials.map((item, itemIndex) => (
                  <article
                    key={`mobile-${groupIndex}-${item.name}-${itemIndex}`}
                    className="testimonial-card testimonials-mobile-card"
                  >
                    <div className="testimonial-rating">★★★★★</div>
                    <p>{item.quote}</p>
                    <TestimonialPhotos item={item} />
                    <span>{item.name}</span>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
