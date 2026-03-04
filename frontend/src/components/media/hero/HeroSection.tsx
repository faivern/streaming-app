import CountUp from "react-countup";

type Props = {
  total_results: number;
};

const HeroSection = ({ total_results }: Props) => {
  const durationTimeSeconds = 4;
  const separatorSymbol = ",";

  return (
    <div className="text-center mb-8 py-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-h1">
        Cinema Atlas {" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
          <CountUp end={total_results} duration={durationTimeSeconds} separator={separatorSymbol} />
        </span>{" "}
        <span className="text-text-h1">Movies & Shows</span>
      </h1>
      <p className="mt-2 text-sm sm:text-base md:text-lg lg:text-xl font-medium text-text-h1/60">
        Explore, discover, and track movies & shows — and find where to stream them.
      </p>
    </div>
  );
};

export default HeroSection;
