"use client";

import { useEffect, useState } from "react";

const navItems = [
  { id: "packs", label: "Packs" },
  { id: "avant-apres", label: "Avant / Après" },
  // { id: "realisations", label: "Réalisations" },
  { id: "temoignages", label: "Avis" },
  { id: "zone", label: "Zone" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="container nav-inner">
        <div className="brand">LN AUTOSHINE</div>
        <nav className="nav-links">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
        <button className="btn" type="button" data-open-booking>
          Prendre rendez-vous
        </button>
      </div>
    </header>
  );
}
