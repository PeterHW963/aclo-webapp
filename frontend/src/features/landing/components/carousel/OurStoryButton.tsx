import { Link } from "react-router-dom";

const OurStoryButton: React.FC = () => (
  <div className="flex flex-col items-center text-center max-w-2xl mx-auto pt-5">
    <Link
      to="/story"
      className="
          inline-flex items-center justify-center
          bg-acloblue text-background font-light rounded-xl
          text-sm sm:text-base md:text-lg
          px-4 py-1 sm:px-7 md:px-6
        "
    >
      Our Story
    </Link>
  </div>
);

export default OurStoryButton;
