"use client";

import { useEffect, useState } from "react";

export default function StartupLoader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      setDone(true);
      document.body.classList.remove("is-loading");
    };

    document.body.classList.add("is-loading");

    const video = document.getElementById("hero-video") as HTMLVideoElement | null;

    const onReady = () => finish();

    if (video) {
      if (video.readyState >= 3) {
        finish();
      } else {
        video.addEventListener("canplay", onReady, { once: true });
      }
    }

    window.addEventListener("load", onReady, { once: true });

    const timeoutId = window.setTimeout(() => finish(), 1000);

    return () => {
      window.removeEventListener("load", onReady);
      video?.removeEventListener("canplay", onReady);
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (done) return null;

  return (
    <div className="startup-loader" aria-hidden>
      <div className="startup-loader__mark" />
      <div className="startup-loader__line" />
    </div>
  );
}
