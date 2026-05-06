"use client";

import { useEffect, useState } from "react";
import WhatsAppIcon from "./WhatsAppIcon";

type MobileStickyCtaProps = {
  whatsappHref: string;
};

export default function MobileStickyCta({ whatsappHref }: MobileStickyCtaProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const revealAfter = Math.min(360, Math.max(180, window.innerHeight * 0.35));
      setIsVisible(window.scrollY > revealAfter);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
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
