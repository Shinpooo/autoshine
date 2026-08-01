"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import BeforeAfter from "./BeforeAfter";

const AUTO_ADVANCE_MS = 10_000;

const transformations = [
  {
    id: "bmw-touring",
    vehicle: "BMW Série 3 Touring",
    beforeSrc: "/images/before-after-bmw-before.webp",
    afterSrc: "/images/before-after-bmw-after.webp",
  },
  {
    id: "porsche-macan",
    vehicle: "Porsche Macan",
    beforeSrc: "/images/before-after-porsche-before.webp",
    afterSrc: "/images/before-after-porsche-after.webp",
  },
] as const;

function CarouselArrow({ direction }: { direction: "previous" | "next" }) {
  const isPrevious = direction === "previous";

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={isPrevious ? "M12.5 4.5 7 10l5.5 5.5" : "m7.5 4.5 5.5 5.5-5.5 5.5"} />
    </svg>
  );
}

export default function BeforeAfterCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"previous" | "next">("next");
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isPageInactive, setIsPageInactive] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [cycleId, setCycleId] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const remainingMsRef = useRef(AUTO_ADVANCE_MS);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const isPaused =
    isHovered ||
    isFocusedWithin ||
    isPointerDown ||
    isPageInactive ||
    !isInView ||
    prefersReducedMotion;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || !("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.35),
      { threshold: [0, 0.35, 1] },
    );

    observer.observe(carousel);
    return () => observer.disconnect();
  }, []);

  const resetAutoplay = useCallback(() => {
    clearTimer();
    startedAtRef.current = null;
    remainingMsRef.current = AUTO_ADVANCE_MS;
    setCycleId((current) => current + 1);
  }, [clearTimer]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () =>
      setPrefersReducedMotion(motionQuery.matches);
    const syncPageActivity = () =>
      setIsPageInactive(document.hidden || !document.hasFocus());

    syncMotionPreference();
    syncPageActivity();
    motionQuery.addEventListener("change", syncMotionPreference);
    document.addEventListener("visibilitychange", syncPageActivity);
    window.addEventListener("focus", syncPageActivity);
    window.addEventListener("blur", syncPageActivity);

    return () => {
      motionQuery.removeEventListener("change", syncMotionPreference);
      document.removeEventListener("visibilitychange", syncPageActivity);
      window.removeEventListener("focus", syncPageActivity);
      window.removeEventListener("blur", syncPageActivity);
    };
  }, []);

  useEffect(() => {
    clearTimer();

    if (isPaused) return;

    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      startedAtRef.current = null;
      remainingMsRef.current = AUTO_ADVANCE_MS;
      setDirection("next");
      setActiveIndex((current) => (current + 1) % transformations.length);
      setCycleId((current) => current + 1);
    }, remainingMsRef.current);

    return () => {
      clearTimer();

      if (startedAtRef.current !== null) {
        const elapsed = Date.now() - startedAtRef.current;
        remainingMsRef.current = Math.max(
          0,
          remainingMsRef.current - elapsed,
        );
        startedAtRef.current = null;
      }
    };
  }, [activeIndex, clearTimer, cycleId, isPaused]);

  const selectSlide = (
    index: number,
    nextDirection: "previous" | "next" = index > activeIndex
      ? "next"
      : "previous",
  ) => {
    resetAutoplay();
    if (index === activeIndex) return;
    setDirection(nextDirection);
    setActiveIndex(index);
  };

  const handleFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    resetAutoplay();
    setIsFocusedWithin(true);
  };

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    setIsFocusedWithin(false);
  };

  const handleInteractionStart = () => {
    resetAutoplay();
    setIsPointerDown(true);
  };

  const showPrevious = () => {
    const previousIndex =
      (activeIndex - 1 + transformations.length) % transformations.length;
    selectSlide(previousIndex, "previous");
  };

  const showNext = () => {
    const nextIndex = (activeIndex + 1) % transformations.length;
    selectSlide(nextIndex, "next");
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();

    const nextDirection = event.key === "ArrowRight" ? "next" : "previous";
    const offset = nextDirection === "next" ? 1 : -1;
    const nextIndex =
      (index + offset + transformations.length) % transformations.length;
    selectSlide(nextIndex, nextDirection);
  };

  return (
    <div
      ref={carouselRef}
      className="ba-carousel"
      role="region"
      aria-roledescription="carrousel"
      aria-label="Transformations avant et après"
      data-autoplay-paused={isPaused}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
      onPointerDownCapture={handleInteractionStart}
      onPointerUpCapture={() => setIsPointerDown(false)}
      onPointerCancelCapture={() => setIsPointerDown(false)}
    >
      <div className="ba-carousel__viewport">
        <div
          className="ba-carousel__caption"
          key={transformations[activeIndex].id}
          aria-live="polite"
        >
          <span>Transformation 0{activeIndex + 1}</span>
          <strong>{transformations[activeIndex].vehicle}</strong>
        </div>

        {transformations.map((transformation, index) => (
          <div
            className={`ba-carousel__slide${index === activeIndex ? ` is-active is-${direction}` : ""}`}
            id={`ba-panel-${transformation.id}`}
            key={transformation.id}
            role="tabpanel"
            aria-labelledby={`ba-tab-${transformation.id}`}
            aria-hidden={index !== activeIndex}
            inert={index !== activeIndex}
          >
            <BeforeAfter
              beforeSrc={transformation.beforeSrc}
              afterSrc={transformation.afterSrc}
              vehicle={transformation.vehicle}
            />
          </div>
        ))}
      </div>

      <div className="ba-carousel__dock">
        <span className="ba-carousel__counter" aria-live="polite">
          <strong>0{activeIndex + 1}</strong>
          <span>/ 0{transformations.length}</span>
        </span>

        <div
          className="ba-carousel__progress"
          role="tablist"
          aria-label="Choisir un véhicule"
        >
          {transformations.map((transformation, index) => (
            <button
              className={`ba-carousel__progress-tab${index === activeIndex ? " is-active" : ""}${index === activeIndex && isPaused ? " is-paused" : ""}`}
              id={`ba-tab-${transformation.id}`}
              key={transformation.id}
              type="button"
              role="tab"
              aria-label={`Afficher ${transformation.vehicle}`}
              aria-selected={index === activeIndex}
              aria-controls={`ba-panel-${transformation.id}`}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => selectSlide(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span
                aria-hidden="true"
                key={
                  index === activeIndex
                    ? `${transformation.id}-${cycleId}`
                    : transformation.id
                }
              />
            </button>
          ))}
        </div>

        <div className="ba-carousel__navigation" aria-label="Navigation du carrousel">
          <button
            className="ba-carousel__arrow"
            type="button"
            onClick={showPrevious}
            aria-label="Voir la transformation précédente"
          >
            <CarouselArrow direction="previous" />
          </button>
          <button
            className="ba-carousel__arrow"
            type="button"
            onClick={showNext}
            aria-label="Voir la transformation suivante"
          >
            <CarouselArrow direction="next" />
          </button>
        </div>
      </div>
    </div>
  );
}
