import { useState, type CSSProperties, type MouseEventHandler } from "react";

type CloudinarySize = "hero" | "large" | "medium" | "small";

type CloudinaryImageProps = {
  publicId: string;
  alt: string;
  size?: CloudinarySize;
  width?: number;
  className?: string;
  usePlaceholder?: boolean;
  lazy?: boolean;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLImageElement>;
};

const IMAGE_WIDTHS: Record<CloudinarySize, number> = {
  hero: 2200,
  large: 1400,
  medium: 900,
  small: 500,
};

export default function CloudinaryImage({
  publicId,
  alt,
  size = "medium",
  width,
  className = "",
  usePlaceholder = false,
  lazy = true,
  style,
  onClick,
}: CloudinaryImageProps) {
  const [loaded, setLoaded] = useState(false);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const finalWidth = width ?? IMAGE_WIDTHS[size];

  const lowSrc = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_30/${publicId}`;
  const highSrc = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto:good,w_${finalWidth}/${publicId}`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {usePlaceholder && !loaded && (
        <img
          src={lowSrc}
          alt=""
          aria-hidden="true"
          style={style}
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-lg"
        />
      )}

      <img
        src={highSrc}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        style={style}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          usePlaceholder
            ? loaded
              ? "opacity-100"
              : "opacity-0"
            : "opacity-100"
        }`}
      />
    </div>
  );
}
