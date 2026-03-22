import CloudinaryImage from "../../../shared/components/common/CloudinaryImage";
import {
  assets,
  cloudinaryImageUrl,
} from "../../../shared/constants/cloudinary";

const IntroSection = () => {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-5 lg:gap-5 xl:gap-6">
          {/* image */}
          <div className="flex justify-center">
            <CloudinaryImage
              publicId={assets.intro.publicId}
              alt={assets.intro.alt}
              size="medium"
              className="w-[360px] h-[360px] md:w-[420px] md:h-[420px]"
              usePlaceholder={true}
              lazy={true}
            />
          </div>

          {/* text */}
          <div className="text-ink mx-auto w-full max-w-md md:max-w-none md:mx-0">
            <h2 className="text-acloblue font-semibold leading-tight text-3xl sm:text-4xl md:text-4xl">
              The little moments that shape them
            </h2>

            <div className="mt-6 md:mt-4 space-y-6 text-md md:text-lg leading-relaxed text-justify">
              <p>
                When little ones start getting curious, many parents feel unsure
                about letting them help in their daily routines.
                <br />
                But these small moments are exactly what nurture their{" "}
                <span className="text-acloblue font-semibold">
                  curiosity
                </span>,{" "}
                <span className="text-acloblue font-semibold">
                  independence
                </span>
                , and{" "}
                <span className="text-acloblue font-semibold">self-growth</span>
                .
              </p>

              <p>
                Kids learn by doing. Every tiny routine becomes a step toward
                raising{" "}
                <span className="text-acloblue font-semibold">confident</span>,{" "}
                <span className="text-acloblue font-semibold">capable</span>{" "}
                little ones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
