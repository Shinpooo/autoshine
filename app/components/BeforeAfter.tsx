"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";

type BeforeAfterProps = {
  beforeSrc: string;
  afterSrc: string;
  vehicle: string;
};

export default function BeforeAfter({
  beforeSrc,
  afterSrc,
  vehicle,
}: BeforeAfterProps) {
  const [position, setPosition] = useState(33);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ctaRevealed = position >= 63;
  const updatePositionFromPointer = (clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nextPosition = ((clientX - rect.left) / rect.width) * 100;
    setHasInteracted(true);
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
          src={afterSrc}
          alt={`${vehicle} après detailing`}
          fill
          draggable={false}
          sizes="(max-width: 900px) 90vw, 1200px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="ba-image ba-after">
        <Image
          src={beforeSrc}
          alt={`${vehicle} avant detailing`}
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
      <div
        className={`ba-drag-hint${hasInteracted ? " is-hidden" : ""}`}
        aria-hidden="true"
      >
        Glissez pour révéler <span>→</span>
      </div>
      <input
        className="ba-range"
        type="range"
        min={0}
        max={100}
        value={position}
        onInput={(event) => {
          setHasInteracted(true);
          setPosition(Number(event.currentTarget.value));
        }}
        onChange={(event) => {
          setHasInteracted(true);
          setPosition(Number(event.target.value));
        }}
        aria-label={`Comparer ${vehicle} avant et après`}
      />
      <div className={`ba-inline-cta${ctaRevealed ? " is-visible" : ""}`} aria-hidden={!ctaRevealed}>
        <strong>Convaincu par le résultat ?</strong>
        <button
          className="btn ba-inline-cta__button"
          type="button"
          data-open-booking
          disabled={!ctaRevealed}
        >
          Réserver ce résultat
        </button>
      </div>
    </div>
  );
}
