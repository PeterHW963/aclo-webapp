import React from "react";
import Navbar from "../components/common/Navbar";
import { cloudinaryImageUrl, assets } from "../constants/cloudinary";
import { DesignFeaturesCarousel } from "../components/common/DesignFeaturesCarousel";

const LearnMore: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="bg-background pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* TITLE */}
          <h1 className="text-acloblue font-semibold leading-tight text-2xl sm:text-3xl md:text-3xl text-center pt-5 pb-4">
            Why choose ACLO’s learning tower?
          </h1>

          <div className="space-y-12 md:space-x-16">
            {/* SECTION 1 */}
            <div className="space-y-4">
              <h3 className="text-acloblue text-xl sm:text-2xl md:text-2xl text-center">
                How to choose a learning tower?
              </h3>
            </div>

            <div className="flex flex-col items-center text-justify md:text-center space-y-4">
              <p className="text-md leading-relaxed">
                While there are many kinds of learning towers - from bulky
                regular wooden frames to light but fully plastic designs -{" "}
                <span className="italic">
                  not all of them fit real everyday family life.
                </span>
              </p>

              <p className="text-md leading-relaxed">
                Check out the table below to see why the
                <span className="font-semibold text-acloblue">
                  {" "}
                  ACLO Learning Tower
                </span>{" "}
                is the best.
              </p>

              <img
                src={cloudinaryImageUrl(assets.learnMore.learnMore_1.publicId)}
                alt="Learning tower comparison"
                className="w-full max-w-2xl h-auto object-cover"
                loading="lazy"
              />
            </div>

            {/* SECTION 2 */}
            <section className="space-y-4">
              <h3 className="text-acloblue text-xl sm:text-2xl md:text-2xl text-center">
                Why is ACLO the best wooden foldable learning tower?
              </h3>

              <div className="flex flex-col items-center text-justify md:text-center">
                <img
                  src={cloudinaryImageUrl(
                    assets.learnMore.learnMore_2.publicId,
                  )}
                  alt="Why ACLO is best wooden foldable learning tower"
                  className="w-full max-w-2xl h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </section>

            {/* SECTION 3 */}
            <section className="space-y-4">
              <h3 className="text-acloblue text-xl sm:text-2xl md:text-2xl text-center">
                Design Features You’ll Love
              </h3>

              <div className="w-full flex flex-col items-center max-w-2xl mx-auto">
                <DesignFeaturesCarousel
                  images={[
                    {
                      publicId: assets.learnMore.learnMore_3.publicId,
                      alt: "Stork design features",
                    },
                    {
                      publicId: assets.learnMore.learnMore_4.publicId,
                      alt: "Falcon design features",
                    },
                    {
                      publicId: assets.learnMore.learnMore_5.publicId,
                      alt: "Sparrow design features",
                    },
                    {
                      publicId: assets.learnMore.learnMore_6.publicId,
                      alt: "Two adjustable heights",
                    },
                    {
                      publicId: assets.learnMore.learnMore_7.publicId,
                      alt: "Ultimate child safety features",
                    },
                  ]}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default LearnMore;
