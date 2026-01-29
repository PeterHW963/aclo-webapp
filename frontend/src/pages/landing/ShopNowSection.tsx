import { Link } from "react-router-dom";
import { assets, cloudinaryImageUrl } from "../../constants/cloudinary";

const ShopNowSection = () => {
  return (
    <section className="w-full bg-background pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-5 lg:gap-5 xl:gap-6">
          {/* text */}
          <div className="text-ink order-2 md:order-1 mx-auto w-full max-w-md md:max-w-none md:mx-0">
            <h2 className="text-acloblue font-semibold leading-tight text-3xl sm:text-4xl md:text-4xl">
              Built for little helpers
            </h2>

            <div className="mt-6 md:mt-4 space-y-6 text-md md:text-lg leading-relaxed">
              <p>
                The perfect everyday companion for toddlers learning to do
                things on their own — from self-care routines to simple kitchen
                tasks.
              </p>

              <p>Let their “I can do it myself” moments begin here.</p>

              <Link
                to="/shop"
                className="inline-flex items-center justify-center
                    bg-acloblue text-background font-light rounded-xl
                    text-sm sm:text-base md:text-lg
                    px-4 py-1 sm:px-7 md:px-6"
              >
                Shop Now
              </Link>
            </div>
          </div>

          {/* image */}
          <div className="flex justify-center order-1 md:order-2">
            <img
              src={cloudinaryImageUrl(assets.littleHelpers.publicId)}
              alt={assets.littleHelpers.alt}
              className="w-[360px] h-[360px] md:w-[420px] md:h-[420px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopNowSection;
