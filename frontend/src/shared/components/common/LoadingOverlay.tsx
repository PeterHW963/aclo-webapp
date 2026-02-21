import { assets, cloudinaryImageUrl } from "../../constants/cloudinary";

type LoadingOverlayProps = {
  show: boolean;
  logoSrc?: string; // e.g. "/logo.svg" or imported asset
  logoAlt?: string;
};

export default function LoadingOverlay({ show }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="
        fixed inset-0 z-9999
        flex items-center justify-center
        bg-white/40 backdrop-blur-sm
      "
    >
      <div className="flex flex-col items-center gap-4">
        <img
          src={cloudinaryImageUrl(assets.logos.horizontal.publicId)}
          alt={assets.logos.horizontal.alt}
          className="h-16 w-auto select-none bob mb-4"
          draggable={false}
        />
        <p className="text-base font-medium text-gray-800">
          Loading<span className="dots" aria-hidden="true"></span>
        </p>
      </div>

      {/* Local CSS for bobbing animation */}
      <style>{`
        .bob {
          animation: bob 1.4s ease-in-out infinite;
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
          /* Dots animation */
        .dots::after {
          content: "";
          display: inline-block;
          width: 1.5em; /* reserves space so text doesn't shift */
          text-align: left;
          animation: dots 1.2s steps(4, end) infinite;
        }
        @keyframes dots {
          0%   { content: ""; }
          25%  { content: "."; }
          50%  { content: ".."; }
          75%  { content: "..."; }
          100% { content: ""; }
        }
      `}</style>
    </div>
  );
}
