import type { CSSProperties } from "react";
import {
  getGoogleBusinessReviews,
  type GoogleBusinessReview,
  type GoogleBusinessReviewsData,
  type ReviewImage,
} from "../lib/googleBusinessReviews";

type DisplayReview = GoogleBusinessReview & {
  imageCount?: number;
};

type DisplayReviewsData = Omit<GoogleBusinessReviewsData, "reviews"> & {
  reviews: DisplayReview[];
};

const googleProfileUri =
  "https://www.google.com/maps/search/?api=1&query=LN%20AutoShine%20Huy";

function staticReview(
  id: string,
  name: string,
  text: string,
  images: ReviewImage[] = [],
  imageCount = images.length,
): DisplayReview {
  return {
    id,
    text,
    rating: 5,
    publishedAt: "",
    author: {
      displayName: name,
      photoUri: "",
    },
    images,
    imageCount,
  };
}

const fallbackData: DisplayReviewsData = {
  rating: 5,
  reviewCount: 28,
  profileUri: googleProfileUri,
  reviews: [
    staticReview(
      "antonio-calabrese",
      "Antonio Calabrese",
      "Très bon boulot,(4heures sur une beetle cabriolet) personne consciencieuse et bonne conseillère. Je recommande.",
    ),
    staticReview(
      "nate-williams",
      "nate williams",
      "J'ai découvert le travail de LN AutoShine sur les réseaux sociaux et la qualité de leurs services m'a vraiment impressionné. Ma voiture avait besoin d'être nettoyée avant d'être rendue à son propriétaire. Je referai appel à eux sans hésiter. Service rapide, abordable et de grande qualité.",
    ),
    staticReview(
      "youssef-ouazzani",
      "Youssef Ouazzani",
      "J'ai fait appel à LN AutoShine et je suis vraiment satisfait du résultat. J'ai eu plus que ce que je voulais, je ne peux que recommander",
    ),
    staticReview(
      "didier-barbe",
      "didier barbe",
      "Un pro passionné n'hésitez pas a faire appel a ses services",
    ),
    staticReview(
      "animal-sans-logis",
      "ASBL Animal Sans Logis",
      "Service impeccable . Merci et à bientôt .",
    ),
    staticReview(
      "antonino-castiglione",
      "Antonino Castiglione",
      "Très sympa et efficace un travail très bien fait",
      [
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
    ),
    staticReview(
      "noa",
      "Noa",
      "Professionnels et flexibles sur les horaires de prestations. Font en sorte de trouver des compromis pour faciliter les prestations. Je suis très satisfait du nettoyage de mon VW Caddy et recommande grandement",
      [
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
      4,
    ),
    staticReview(
      "isabelle-baccus",
      "isabelle baccus",
      "Je recommande a 100% travail de qualite!!! Tres professionnel encore merci a vous 😊 Bonne route et a bientot😉",
      [
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
      4,
    ),
  ],
};

function formatRating(rating: number) {
  return new Intl.NumberFormat("fr-BE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);
}

function formatRelativeDate(date: string) {
  if (!date) {
    return "";
  }

  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  const days = Math.round((timestamp - Date.now()) / 86_400_000);
  const relativeTime = new Intl.RelativeTimeFormat("fr", {
    numeric: "auto",
  });

  if (Math.abs(days) < 30) {
    return relativeTime.format(days, "day");
  }

  const months = Math.round(days / 30.44);
  if (Math.abs(months) < 12) {
    return relativeTime.format(months, "month");
  }

  return relativeTime.format(Math.round(months / 12), "year");
}

function ReviewStars({ rating }: { rating: number }) {
  const roundedRating = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <div
      className="testimonial-rating"
      aria-label={`${formatRating(rating)} étoiles sur 5`}
    >
      <span aria-hidden>
        {"★".repeat(roundedRating)}
        {"☆".repeat(5 - roundedRating)}
      </span>
    </div>
  );
}

function ReviewPhotos({ review }: { review: DisplayReview }) {
  const images = review.images.slice(0, 3);
  if (!images.length) {
    return null;
  }

  const extraCount = Math.max(
    (review.imageCount ?? review.images.length) - images.length,
    0,
  );

  return (
    <div
      className="testimonial-photos"
      aria-label={`Photos de l'avis Google de ${review.author.displayName}`}
    >
      {images.map((image, index) => (
        <div className="testimonial-photo-wrap" key={image.src}>
          {/* Google Business Profile returns dynamic FIFE image URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            width="160"
            height="120"
            loading="lazy"
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

function ReviewCard({
  review,
  className = "",
}: {
  review: DisplayReview;
  className?: string;
}) {
  const relativeDate = formatRelativeDate(review.publishedAt);

  return (
    <article className={`testimonial-card ${className}`.trim()}>
      <ReviewStars rating={review.rating} />
      <p>{review.text}</p>
      <ReviewPhotos review={review} />
      <div className="testimonial-author">
        <div className="testimonial-author-details">
          <strong>{review.author.displayName}</strong>
          {relativeDate ? <small>{relativeDate}</small> : null}
        </div>
      </div>
    </article>
  );
}

export default async function TestimonialsSection() {
  const result = await getGoogleBusinessReviews();
  const isLive = result.status === "ready" && result.data.reviews.length > 0;
  const data: DisplayReviewsData = isLive ? result.data : fallbackData;
  const testimonials = data.reviews;
  const columnCount = Math.min(3, Math.max(1, testimonials.length));
  const columns = Array.from({ length: columnCount }, (_, columnIndex) =>
    testimonials.filter((_, index) => index % columnCount === columnIndex),
  );
  const durations = [28, 46, 28];
  const formattedRating = formatRating(data.rating);

  return (
    <section className="section" id="temoignages">
      <div className="container">
        <p className="eyebrow">Ils nous font confiance</p>
        <div className="testimonials-heading">
          <h2 className="section-title">Avis Google</h2>
          <a
            className="google-rating-badge"
            href={data.profileUri}
            target="_blank"
            rel="noreferrer"
            aria-label={`Note Google : ${formattedRating} sur 5, ${data.reviewCount} avis`}
          >
            <strong>{formattedRating}</strong>
            <span aria-hidden>★★★★★</span>
            <small>{data.reviewCount} avis</small>
          </a>
        </div>
        <p className="section-subtitle">
          Des retours clients authentiques sur la qualité des finitions.
        </p>
        <div
          className="testimonials-marquee"
          style={{ "--testimonial-columns": columnCount } as CSSProperties}
        >
          {columns.map((column, columnIndex) => (
            <div className="testimonials-column" key={`col-${columnIndex}`}>
              <div
                className="testimonials-track"
                style={
                  {
                    "--scroll-duration": `${durations[columnIndex]}s`,
                  } as CSSProperties
                }
              >
                {[...column, ...column].map((review, reviewIndex) => (
                  <ReviewCard
                    key={`${columnIndex}-${review.id}-${reviewIndex}`}
                    review={review}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="testimonials-mobile" aria-label="Avis clients">
          <div className="testimonials-mobile-track">
            {[0, 1, 2].map((groupIndex) => (
              <div
                className="testimonials-mobile-group"
                key={`mobile-group-${groupIndex}`}
                aria-hidden={groupIndex > 0}
              >
                {testimonials.map((review, reviewIndex) => (
                  <ReviewCard
                    key={`mobile-${groupIndex}-${review.id}-${reviewIndex}`}
                    review={review}
                    className="testimonials-mobile-card"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
