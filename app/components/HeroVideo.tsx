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
  const [src, setSrc] = useState("/images/videobg.mp4");

  useEffect(() => {
    const index = Math.floor(Math.random() * HERO_VIDEOS.length);
    setSrc(HERO_VIDEOS[index]);
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
      preload="auto"
      poster="/images/hero-pexels.jpg"
    />
  );
}
