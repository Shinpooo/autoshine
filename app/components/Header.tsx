"use client";

import { useEffect, useRef, useState } from "react";

const navItems = [
  { id: "packs", label: "Packs" },
  { id: "avant-apres", label: "Avant / Après" },
  // { id: "realisations", label: "Réalisations" },
  { id: "temoignages", label: "Avis" },
  { id: "zone", label: "Zone" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const clickLockRef = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    let ticking = false;

    const updateActive = () => {
      const visible = sections
        .map((section) => ({ section, rect: section.getBoundingClientRect() }))
        .filter(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight);

      if (!visible.length) {
        setActive(null);
        return;
      }

      const sorted = visible.sort((a, b) => a.rect.top - b.rect.top);
      const firstInView = sorted.find(({ rect }) => rect.top >= 0);
      const closestToTop = firstInView ?? sorted[sorted.length - 1];

      setActive(closestToTop?.section.id ?? null);
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!clickLockRef.current) {
            updateActive();
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="container nav-inner">
        <div className="brand">LN AUTOSHINE</div>
        <nav className="nav-links">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={active === item.id ? "active" : undefined}
              onClick={() => {
                setActive(item.id);
                clickLockRef.current = true;
                window.setTimeout(() => {
                  clickLockRef.current = false;
                  updateActive();
                }, 350);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button className="btn" type="button">
          Prendre rendez-vous
        </button>
      </div>
    </header>
  );
}
