"use client";

import { useEffect, useState } from "react";

const HERO_VIDEOS = [
  "/images/videobg.mp4",
  "/images/videobg2.mp4",
  "/images/videobg3.mp4",
  "/images/videobg4.mp4",
  "/images/videobg5.mp4",
];

export default function HeroVideo() {
  const [src, setSrc] = useState(HERO_VIDEOS[0]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSrc(HERO_VIDEOS[Math.floor(Math.random() * HERO_VIDEOS.length)]);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <video
      key={src}
      className="hero-video"
      id="hero-video"
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/images/pexels-lynxexotics.jpg"
    />
  );
}
