import React from "react";
import Navbar from "../../../shared/components/common/Navbar";
import { assets } from "../../../shared/constants/cloudinary";
import CloudinaryImage from "../../../shared/components/common/CloudinaryImage";

const Story: React.FC = () => {
  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 sm:py-20">
        <h1 className="text-center text-acloblue text-3xl sm:text-4xl font-medium">
          Our Story
        </h1>

        <div className="mt-14 sm:mt-16 space-y-20 sm:space-y-24">
          <section>
            <h2 className="text-acloblue text-4xl sm:text-5xl font-semibold">
              About us
            </h2>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
              <div className="flex justify-center md:justify-start">
                <CloudinaryImage
                  publicId={assets.story.story_1.publicId}
                  alt=""
                  size="large"
                  className="h-[400px] w-full"
                  usePlaceholder={true}
                  lazy={true}
                />
              </div>

              <div className="text-md leading-7 text-ink/80 space-y-4">
                <p>
                  <span className="text-acloblue font-semibold">ACLO Kids</span>{" "}
                  was born from a simple belief:{" "}
                  <span className="text-acloblue font-semibold">
                    children thrive when given the chance to do things by
                    themselves.
                  </span>
                </p>

                <p>
                  Inspired by child-led learning principles, we develop{" "}
                  <span className="text-acloblue font-semibold">
                    furniture and tools
                  </span>{" "}
                  that help parents nurture{" "}
                  <span className="text-acloblue font-semibold">
                    independence, confidence, and a love of learning, right at
                    home.
                  </span>
                </p>

                <p>
                  Every ACLO product is thoughtfully crafted for modern homes:
                  foldable, compact, and safe, perfect even for limited spaces.{" "}
                  <span className="text-acloblue font-semibold">
                    Designed in Singapore,
                  </span>{" "}
                  built with{" "}
                  <span className="text-acloblue font-semibold">
                    world-class quality,
                  </span>{" "}
                  and approved by{" "}
                  <span className="text-acloblue font-semibold">
                    Montessori educators,
                  </span>{" "}
                  our products blend functionality, beauty, and educational
                  value.
                </p>
              </div>
            </div>

            <p className="mt-10 sm:mt-12 text-center text-acloblue font-semibold text-lg sm:text-xl">
              “More than furniture - a lifelong companion in your child’s
              growth”
            </p>
          </section>

          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-acloblue text-4xl sm:text-5xl font-semibold">
                  Who we are
                </h2>

                <div className="mt-6 text-md leading-7 text-ink/80 space-y-4">
                  <p>
                    ACLO is a family-founded brand built on one simple belief:
                    every child is capable, confident, and full of potential
                    when given the right environment to explore and grow.
                  </p>

                  <p>
                    Our story began when we were searching for products that
                    could truly support our children at home, beautiful enough
                    to belong in a modern space, yet strong, safe, and designed
                    to nurture independence. We couldn’t find anything that felt
                    quite right, so we decided to create our own.
                  </p>
                </div>
              </div>

              <div className="flex justify-center md:justify-end order-1 md:order-2">
                <CloudinaryImage
                  publicId={assets.story.story_2.publicId}
                  alt=""
                  size="large"
                  className="h-[400px] w-full"
                  usePlaceholder={true}
                  lazy={true}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
              <div className="flex justify-center md:justify-start">
                <CloudinaryImage
                  publicId={assets.story.story_3.publicId}
                  alt=""
                  size="large"
                  className="h-[400px] w-full"
                  usePlaceholder={true}
                  lazy={true}
                />
              </div>

              <div className="text-md leading-7 text-ink/80 space-y-4">
                <p>
                  Drawing from experience in Montessori education, corporate
                  work, and real everyday parenting, we started designing tools
                  that invite little ones into daily routines: getting ready at
                  the sink, helping in the kitchen, joining simple chores. One
                  of the very first pieces was a learning tower inspired by our
                  own child’s curiosity to “do it by myself.”
                </p>

                <p>
                  Today, ACLO remains closely involved in every step, from
                  design and material selection to production and quality
                  checks, so each product that reaches your home reflects the
                  same values we hold in ours: safety, independence, and the
                  simple joy of learning together as a family.
                </p>
              </div>
            </div>
          </section>

          <section className="pt-2">
            <h2 className="mx-auto max-w-2xl text-center text-acloblue text-xl leading-7">
              Start their first steps toward independence - safe by your side,
              in everyday moments that become the sweetest memories.
            </h2>

            <div className="mt-8 flex justify-center">
              <a
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-acloblue px-7 py-3 text-md font-medium text-white hover:opacity-80 transition"
              >
                Shop Now
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Story;
