import { useMemo, useRef, useState } from "react";
import { cloudinaryImageUrl } from "../../constants/cloudinary";

type FeatureImage = {
  publicId: string;
  alt?: string;
  caption?: string;
};

export function DesignFeaturesCarousel({
  images,
  initialIndex = 0,
  swipeThreshold = 40,
}: {
  images: FeatureImage[];
  initialIndex?: number;
  swipeThreshold?: number;
}) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);

  const [activeId, setActiveId] = useState<string>(
    safeImages[initialIndex]?.publicId ?? safeImages[0]?.publicId ?? "",
  );

  const startXRef = useRef<number | null>(null);

  const getCurrentIndex = () => {
    if (!safeImages.length) return 0;
    const idx = safeImages.findIndex((img) => img.publicId === activeId);
    return idx >= 0 ? idx : 0;
  };

  const currentIndex = getCurrentIndex();
  const current = safeImages[currentIndex];

  const goPrev = () => {
    if (!safeImages.length) return;
    const nextIndex =
      (currentIndex - 1 + safeImages.length) % safeImages.length;
    setActiveId(safeImages[nextIndex].publicId);
  };

  const goNext = () => {
    if (!safeImages.length) return;
    const nextIndex = (currentIndex + 1) % safeImages.length;
    setActiveId(safeImages[nextIndex].publicId);
  };

  const handleSwipe = (deltaX: number) => {
    if (Math.abs(deltaX) < swipeThreshold) return;
    if (deltaX < 0) goNext();
    else goPrev();
  };

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    startXRef.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const startX = startXRef.current;
    if (startX == null) return;
    const endX = e.changedTouches[0]?.clientX ?? startX;
    handleSwipe(endX - startX);
    startXRef.current = null;
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    startXRef.current = e.clientX;
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const startX = startXRef.current;
    if (startX == null) return;
    handleSwipe(e.clientX - startX);
    startXRef.current = null;
  };

  if (!safeImages.length) return null;

  return (
    <div className="w-full">
      <div
        className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-black/5 select-none touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        role="group"
        aria-roledescription="carousel"
        aria-label="Design features carousel"
      >
        <img
          src={cloudinaryImageUrl(activeId)}
          alt={current?.alt ?? "Feature image"}
          className="w-full h-auto object-cover pointer-events-none"
          loading="lazy"
          draggable={false}
        />

        {current?.caption && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center rounded-full bg-acloblue px-3 py-1 text-md font-semibold text-white shadow">
              {current.caption}
            </span>
          </div>
        )}

        {safeImages.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800
                       rounded-full w-10 h-10 flex items-center justify-center shadow"
          >
            ‹
          </button>
        )}

        {safeImages.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800
                       rounded-full w-10 h-10 flex items-center justify-center shadow"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
