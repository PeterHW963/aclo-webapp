import React from "react";

import Navbar from "../../../shared/components/common/Navbar";
import {
  cloudinaryImageUrl,
  assets,
} from "../../../shared/constants/cloudinary";
import { DesignFeaturesCarousel } from "../../../shared/components/common/DesignFeaturesCarousel";
import CloudinaryImage from "../../../shared/components/common/CloudinaryImage";

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

              <CloudinaryImage
                publicId={assets.learnMore.learnMore_1.publicId}
                alt="Learning tower comparison"
                size="medium"
                className="w-full max-w-2xl h-auto object-cover"
                usePlaceholder={true}
                lazy={true}
              />
            </div>

            {/* SECTION 2 */}
            <section className="space-y-4">
              <h3 className="text-acloblue text-xl sm:text-2xl md:text-2xl text-center">
                Why is ACLO the best wooden foldable learning tower?
              </h3>

              <div className="flex flex-col items-center text-justify md:text-center">
                <CloudinaryImage
                  publicId={assets.learnMore.learnMore_2.publicId}
                  alt="Why ACLO is best wooden foldable learning tower"
                  size="medium"
                  className="w-full max-w-2xl h-auto object-cover"
                  usePlaceholder={true}
                  lazy={true}
                />
              </div>
            </section>

            {/* SECTION 3 */}
            <section className="space-y-6">
              <h3 className="text-acloblue text-xl sm:text-2xl md:text-2xl text-center">
                Design Features You’ll Love
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                {/* Adjustable heights */}
                <div className="w-full">
                  <p className="text-center text-acloblue font-semibold mb-3">
                    Adjustable Heights
                  </p>

                  <DesignFeaturesCarousel
                    images={[
                      {
                        publicId:
                          assets.learnMore.adjustableHeights.stork.publicId,
                        alt: "Stork - adjustable heights",
                        caption: "Stork",
                      },
                      {
                        publicId:
                          assets.learnMore.adjustableHeights.falcon.publicId,
                        alt: "Falcon - adjustable heights",
                        caption: "Falcon",
                      },
                      {
                        publicId:
                          assets.learnMore.adjustableHeights.sparrow.publicId,
                        alt: "Sparrow - adjustable heights",
                        caption: "Sparrow",
                      },
                    ]}
                  />
                </div>

                {/* Safety */}
                <div className="w-full">
                  <p className="text-center text-acloblue font-semibold mb-3">
                    Safety Features
                  </p>

                  <DesignFeaturesCarousel
                    images={[
                      {
                        publicId: assets.learnMore.safety.stork.publicId,
                        alt: "Stork - safety features",
                        caption: "Stork",
                      },
                      {
                        publicId: assets.learnMore.safety.falcon.publicId,
                        alt: "Falcon - safety features",
                        caption: "Falcon",
                      },
                      {
                        publicId: assets.learnMore.safety.sparrow.publicId,
                        alt: "Sparrow - safety features",
                        caption: "Sparrow",
                      },
                    ]}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default LearnMore;
