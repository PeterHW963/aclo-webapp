import Header from "./Header";
import EmblaCarousel from "./EmblaCarousel";
import type { EmblaOptionsType } from "embla-carousel";
import { assets } from "../../../../shared/constants/cloudinary";
import OurStoryButton from "./OurStoryButton";

const OPTIONS: EmblaOptionsType = {
  align: "center",
  containScroll: "trimSnaps",
  loop: true,
  duration: 25,
  skipSnaps: false,
  dragThreshold: 6,
};

const Carousel: React.FC = () => (
  <div className="bg-background ">
    <Header />
    <EmblaCarousel
      slides={[...assets.independenceCarousel]}
      options={OPTIONS}
    />
    <OurStoryButton />
  </div>
);

export default Carousel;
