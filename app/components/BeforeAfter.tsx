"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";

export default function BeforeAfter() {
  const [position, setPosition] = useState(33);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ctaRevealed = position >= 72;
  const updatePositionFromPointer = (clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nextPosition = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, Math.round(nextPosition))));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("[data-open-booking]")) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    updatePositionFromPointer(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    updatePositionFromPointer(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      className="ba"
      style={{ "--pos": `${position}%` } as CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="ba-image">
        <Image
          src="/images/after-clean-v3.png"
          alt="Après detailing"
          fill
          draggable={false}
          sizes="(max-width: 900px) 90vw, 1200px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="ba-image ba-after">
        <Image
          src="/images/before-clean-v3.png"
          alt="Avant detailing"
          fill
          draggable={false}
          sizes="(max-width: 900px) 90vw, 1200px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="ba-handle" aria-hidden="true">
        <span className="ba-grip">
          <span />
          <span />
          <span />
        </span>
      </div>
      <input
        className="ba-range"
        type="range"
        min={0}
        max={100}
        value={position}
        onInput={(event) => setPosition(Number(event.currentTarget.value))}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="Comparer avant et après"
      />
      <div className={`ba-inline-cta${ctaRevealed ? " is-visible" : ""}`} aria-hidden={!ctaRevealed}>
        <button
          className="btn ba-inline-cta__button"
          type="button"
          data-open-booking
          disabled={!ctaRevealed}
        >
          Je veux ce résultat
        </button>
      </div>
    </div>
  );
}
