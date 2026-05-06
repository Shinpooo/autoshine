"use client";

import { useEffect, useState } from "react";
import WhatsAppIcon from "./WhatsAppIcon";

type MobileStickyCtaProps = {
  whatsappHref: string;
};

export default function MobileStickyCta({ whatsappHref }: MobileStickyCtaProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const frame = window.requestAnimationFrame(() => {
      const heroCta = document.querySelector("[data-hero-booking-cta]");
      if (!heroCta || !("IntersectionObserver" in window)) {
        setIsVisible(window.scrollY > window.innerHeight * 0.35);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(!entry.isIntersecting);
        },
        {
          rootMargin: "0px 0px -12% 0px",
          threshold: 0.05,
        }
      );

      observer.observe(heroCta);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      className={`mobile-sticky-cta${isVisible ? " is-visible" : ""}`}
      aria-label="Actions rapides"
      aria-hidden={!isVisible}
    >
      <button
        className="btn"
        type="button"
        data-open-booking
        disabled={!isVisible}
        tabIndex={isVisible ? 0 : -1}
      >
        Voir les disponibilités
      </button>
      <a
        className="mobile-sticky-cta__whatsapp"
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Contacter LN AutoShine sur WhatsApp"
        tabIndex={isVisible ? 0 : -1}
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
}
