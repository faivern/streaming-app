import React from "react";
import CountUp from "react-countup";

type Props = {
  total_results: number;
};

const HeroSection = ({ total_results }: Props) => {
  return (
    <div className="text-center mb-8 py-4">
      <h1 className="sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
        Explore {" "}
        <span className="font-bold text-sky-400">
          <CountUp end={total_results} duration={2.5} separator="," />
        </span>{" "}
        Movies & TV Shows
      </h1>
    </div>
  );
};

export default HeroSection;
