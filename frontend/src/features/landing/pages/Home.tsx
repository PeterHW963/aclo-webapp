import Hero from "../../../shared/components/layout/Hero";

import IntroSection from "../components/IntroSection";
import Carousel from "../components/carousel/Carousel";
import ShopNowSection from "../components/ShopNowSection";
import KeyFeaturesSection from "../components/KeyFeaturesSection";
import ReviewsSection from "../components/ReviewsSection";

const Home = () => {
  return (
    <div>
      <Hero />
      <IntroSection />
      <Carousel />
      <ShopNowSection />
      <KeyFeaturesSection />
      <ReviewsSection />
    </div>
  );
};

export default Home;
