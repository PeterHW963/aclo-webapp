import { Link } from "react-router-dom";

import slimFoldable from "../../assets/icons/icon-slim-foldable.svg";
import lightweightPortable from "../../assets/icons/icon-lightweight-portable.svg";
import strong from "../../assets/icons/icon-strong.svg";
import durableSafe from "../../assets/icons/icon-durable-safe.svg";
import adjustableHeights from "../../assets/icons/icon-adjustable-heights.svg";

type Feature = {
  icon: string;
  label: string;
};

const FEATURES: Feature[] = [
  { icon: slimFoldable, label: "Slim & Foldable" },
  { icon: lightweightPortable, label: "Lightweight & Portable" },
  { icon: strong, label: "Strong" },
  { icon: durableSafe, label: "Durable & Safe" },
  { icon: adjustableHeights, label: "Adjustable Heights" },
];

const KeyFeaturesSection = () => {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8">
        <h2 className="text-acloblue font-semibold text-center text-3xl sm:text-4xl md:text-4xl mb-10">
          Key features
        </h2>

        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-y-20 gap-x-6 md:gap-x-6 place-items-center">
            {FEATURES.map((f, idx) => {
              const isLast = idx === FEATURES.length - 1;

              const mdPlacement =
                idx === 0
                  ? "md:col-span-2 md:col-start-1"
                  : idx === 1
                    ? "md:col-span-2 md:col-start-3"
                    : idx === 2
                      ? "md:col-span-2 md:col-start-5"
                      : idx === 3
                        ? "md:col-span-2 md:col-start-2"
                        : "md:col-span-2 md:col-start-4";

              return (
                <div
                  key={f.label}
                  className={[
                    "flex flex-col items-center text-center",
                    isLast ? "col-span-2" : "",
                    mdPlacement,
                  ].join(" ")}
                >
                  <img
                    src={f.icon}
                    alt={f.label}
                    className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain"
                    loading="lazy"
                  />
                  <p className="mt-4 text-ink text-m md:text-lg whitespace-pre-line">
                    {f.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/learn-more"
            className="inline-flex items-center justify-center
                    bg-acloblue text-background font-light rounded-xl
                    text-sm sm:text-base md:text-lg
                    px-4 py-1 sm:px-7 md:px-6"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default KeyFeaturesSection;
