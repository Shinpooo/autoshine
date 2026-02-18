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
  {
    quote: "Travail ultra soigné. Le résultat est net et durable.",
    name: "Nadia K.",
  },
  {
    quote: "Service ponctuel, véhicule transformé en une session.",
    name: "Julien P.",
  },
  {
    quote: "Excellente prestation à domicile, très professionnel.",
    name: "Sophie L.",
  },
  {
    quote: "Rapide, efficace, finition premium sur chaque détail.",
    name: "Thomas R.",
  },
  {
    quote: "Le meilleur rendu que j'ai eu sur ma voiture.",
    name: "Marc D.",
  },
  {
    quote: "Très satisfait, je reprendrai un créneau sans hésiter.",
    name: "Sarah L.",
  },
];

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
        <h2 className="section-title">Témoignages</h2>
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
                    <span>{item.name}</span>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import type { CSSProperties } from "react";
