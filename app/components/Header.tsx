"use client";

import Image from "next/image";
import Link from "next/link";
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`nav${scrolled || menuOpen ? " scrolled" : ""}`}>
      <div className="container nav-inner">
        <Link className="brand" href="/" aria-label="LN AutoShine accueil">
          <Image
            className="brand-logo brand-logo--nav"
            src="/images/logo-transparent.png"
            alt="LN AutoShine"
            width={2172}
            height={724}
            priority
            sizes="(max-width: 600px) 132px, (max-width: 900px) 148px, 190px"
          />
          <span className="brand-text">LN AUTOSHINE</span>
        </Link>
        <nav className="nav-links">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
        <button
          className={`mobile-menu-button${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <button className="btn" type="button" data-open-booking>
          Voir les disponibilités
        </button>
      </div>
      <nav
        className={`mobile-nav${menuOpen ? " is-open" : ""}`}
        id="mobile-navigation"
        aria-label="Navigation mobile"
      >
        {navItems.map((item) => (
          <a key={item.id} href={`#${item.id}`} onClick={closeMenu}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
