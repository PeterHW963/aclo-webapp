import { Link } from "react-router-dom";
// import heroImg from "../../assets/hero-img1.jpg";
import Navbar from "../common/Navbar";
import { assets, cloudinaryImageUrl } from "../../constants/cloudinary";
import CloudinaryImage from "../common/CloudinaryImage";

const Hero = () => {
  return (
    <section className="relative">
      <CloudinaryImage
        publicId={assets.hero.publicId}
        alt={assets.hero.alt}
        size="hero"
        className="w-full h-[500px] md:h-[700px] lg:h-[760px]"
        usePlaceholder={true}
        lazy={false}
      />

      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <div className="absolute inset-0 bg-white/20 flex items-center justify-start">
        <div className="w-full max-w-3xl text-left text-accent1 px-6 sm:px-10 lg:px-16">
          <div className="pt-10 sm:pt-14 md:pt-20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tighter mb-2">
              #1 Premium <br />
              Learning Tower <br />
              in Indonesia
            </h1>
            <p className="mt-4 text-base sm:text-lg md:text-xl lg:text-2xl tracking-wide font-light text-accent1/95">
              🇸🇬 Designed in Singapore <br /> 🌎 World-class quality <br /> 👍
              Approved by Montessori educators
            </p>
          </div>
          <Link
            to="/shop"
            className="
                mt-6 inline-flex items-center justify-center
                bg-acloblue text-background font-light rounded-xl
                text-sm sm:text-base md:text-lg
                px-5 py-3 sm:px-7 sm:py-3 md:px-8 md:py-3
                shadow-sm hover:opacity-95 transition
              "
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
