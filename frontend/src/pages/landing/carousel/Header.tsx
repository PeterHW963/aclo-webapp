const Header: React.FC = () => (
  <div className="bg-background pl-3 pr-3 pb-10">
    <h1 className="text-acloblue font-semibold leading-tight text-3xl sm:text-4xl md:text-4xl text-center pt-5 pb-4 bg-background">
      How can we help our kids become more independent?
    </h1>
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
      <p className="mt-4 md:mt-2 text-md md:text-lg leading-relaxed">
        By letting them{" "}
        <span className="font-semibold">explore the grown-up world safely</span>{" "}
        and <span className="font-semibold">confidently</span>.
      </p>
      {/* <p className="mt-4 md:mt-2 text-sm xl:text-sm leading-relaxed">
        From getting ready at the sink to helping in the kitchen,{" "}
        <span className="font-semibold text-acloblue">
          ACLO’s Learning Tower
        </span>{" "}
        gives little ones a safe place to climb, explore, and join real-life
        moments at your height.
      </p> */}
    </div>
  </div>
);

export default Header;
