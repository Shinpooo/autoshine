"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";

export default function BeforeAfter() {
  const [position, setPosition] = useState(33);

  return (
    <div className="ba" style={{ "--pos": `${position}%` } as CSSProperties}>
      <div className="ba-image">
        <Image
          src="/images/after-clean-v2.jpg"
          alt="Apres detailing"
          fill
          sizes="(max-width: 900px) 100vw, 900px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="ba-image ba-after">
        <Image
          src="/images/before-wash-v2.png"
          alt="Avant detailing"
          fill
          sizes="(max-width: 900px) 100vw, 900px"
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
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="Comparer avant et après"
      />
    </div>
  );
}
