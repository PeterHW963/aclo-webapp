import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { cloudinaryImageUrl } from "../../constants/cloudinary";
import { StarIcon } from "@heroicons/react/24/solid";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchFeatReviews } from "../../redux/slices/reviewsSlice";
import type { ReviewSlide } from "../../types/carousels";

const ANIM_MS = 500;
const FAILSAFE_MS = ANIM_MS + 200;

const ReviewsSection: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchFeatReviews());
  }, [dispatch]);

  const { reviews, loading, error } = useAppSelector((state) => state.reviews);
  const baseSlides: ReviewSlide[] = useMemo(() => {
    return (reviews ?? []).map((r) => ({
      publicId: r.publicId,
      alt: r.alt,
      productLabel: r.productLabel,
      stars: r.stars,
      quote: r.quote,
      author: r.author,
      ctaTo: r.ctaTo,
      ctaText: r.ctaText,
    }));
  }, [reviews]);

  const realCount = baseSlides.length;

  // clones: [last, ...real, first]
  const slides = useMemo(() => {
    if (!realCount) return [];
    return [baseSlides[realCount - 1], ...baseSlides, baseSlides[0]];
  }, [baseSlides, realCount]);

  // Start on first REAL slide
  const [index, setIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);

  // Locking with failsafe
  const [locked, setLocked] = useState(false);
  const unlockTimerRef = useRef<number | null>(null);

  const lockForAnim = useCallback(() => {
    setLocked(true);

    if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = window.setTimeout(() => {
      setLocked(false);
      unlockTimerRef.current = null;
    }, FAILSAFE_MS);
  }, []);

  const unlock = useCallback(() => {
    setLocked(false);
    if (unlockTimerRef.current) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
  }, []);

  // clears unlockTimerRef timeout on unmount
  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
    };
  }, []);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startXRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  // Measure viewport width (px)
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportW, setViewportW] = useState(0);

  // sets up + cleans up ResizeObserver and window.resize
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setViewportW(w);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!realCount) return;
    requestAnimationFrame(() => {
      const el = viewportRef.current;
      if (!el) return;
      const w = el.getBoundingClientRect().width;
      if (w > 0) setViewportW(w);
    });
  }, [realCount]);

  const prev = useCallback(() => {
    if (locked) return;
    lockForAnim();
    setIsAnimating(true);
    setIndex((i) => i - 1);
  }, [locked, lockForAnim]);

  const next = useCallback(() => {
    if (locked) return;
    lockForAnim();
    setIsAnimating(true);
    setIndex((i) => i + 1);
  }, [locked, lockForAnim]);

  const onTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "transform") return;

      // We finished the visible transition
      unlock();

      // landed on clone? jump instantly to real
      if (index === 0) {
        setIsAnimating(false);
        setIndex(realCount);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setIsAnimating(true)),
        );
      } else if (index === realCount + 1) {
        setIsAnimating(false);
        setIndex(1);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setIsAnimating(true)),
        );
      }
    },
    [index, realCount, unlock],
  );

  // --- swipe / drag handlers ---
  const onPointerDown = (e: React.PointerEvent) => {
    if (locked) return;
    if (!viewportW) return;

    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, textarea, select")) return;

    pointerIdRef.current = e.pointerId;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

    setIsDragging(true);
    setIsAnimating(false);
    setDragOffset(0);
    startXRef.current = e.clientX;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    if (pointerIdRef.current !== e.pointerId) return;

    const delta = e.clientX - startXRef.current;
    setDragOffset(delta);
  };

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      if (pointerIdRef.current !== e.pointerId) return;

      const target = e.currentTarget as HTMLDivElement;

      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }

      const delta = dragOffset;

      setIsDragging(false);
      setDragOffset(0);

      const threshold = Math.max(40, viewportW * 0.12);

      setIsAnimating(true);

      // Only lock if we're actually going to change slide
      if (delta <= -threshold) {
        if (!locked) lockForAnim();
        setIndex((i) => i + 1);
      } else if (delta >= threshold) {
        if (!locked) lockForAnim();
        setIndex((i) => i - 1);
      } else {
        // snap back only — no lock (prevents "stuck" if transitionend is missed)
        unlock();
      }

      pointerIdRef.current = null;
    },
    [isDragging, dragOffset, viewportW, locked, lockForAnim, unlock],
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const trackTransform = isDragging
    ? `translate3d(calc(${-index * 100}% + ${dragOffset}px), 0, 0)`
    : `translate3d(${-index * 100}%, 0, 0)`;

  return (
    <section className="w-full bg-background">
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl py-12 sm:py-16">
          <div className="relative overflow-hidden rounded-2xl bg-[#EFE7DD]">
            <div
              ref={viewportRef}
              className="w-full overflow-hidden"
              style={{ touchAction: "pan-y" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <div
                className={`flex w-full ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{
                  transform: trackTransform,
                  transition: isAnimating
                    ? `transform ${ANIM_MS}ms ease-out`
                    : "none",
                  willChange: "transform",
                }}
                onTransitionEnd={onTransitionEnd}
              >
                {slides.map((s, i) => {
                  const url = cloudinaryImageUrl(s.publicId);
                  return (
                    <div
                      key={`${s.publicId}-${i}`}
                      className="basis-full w-full shrink-0"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 p-5 sm:p-6 md:p-7 items-center">
                        <div className="flex justify-center">
                          <img
                            src={url}
                            alt={s.alt}
                            className="w-55 sm:w-62.5 md:w-67.5 aspect-3/4 object-cover rounded-[26px]"
                            loading="lazy"
                            draggable={false}
                          />
                        </div>

                        <div className="text-center px-6 sm:px-10 md:px-12">
                          <div className="text-acloblue font-semibold text-lg sm:text-xl">
                            {s.productLabel}
                          </div>

                          <div className="mt-2 flex justify-center gap-1 text-acloblue">
                            {Array.from({ length: s.stars }).map((_, si) => (
                              <StarIcon key={si} className="h-5 w-5" />
                            ))}
                          </div>

                          <p className="mt-4 text-ink/80 leading-relaxed text-sm sm:text-base">
                            “{s.quote}”
                          </p>

                          <p className="mt-4 text-ink/60 text-sm sm:text-base">
                            {s.author}
                          </p>

                          <div className="mt-5 flex justify-center">
                            <Link
                              to="/shop"
                              className="inline-flex items-center justify-center bg-acloblue text-white font-light rounded-full text-sm sm:text-base px-6 py-2.5"
                            >
                              {s.ctaText ?? "Shop Now"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={prev}
              aria-label="Previous review"
              disabled={locked}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-acloblue/80 text-white grid place-items-center hover:bg-acloblue disabled:opacity-40"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next review"
              disabled={locked}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-acloblue/80 text-white grid place-items-center hover:bg-acloblue disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
