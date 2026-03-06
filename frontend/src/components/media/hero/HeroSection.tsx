import CountUp from "react-countup";

type Props = {
  total_results: number;
};

const HeroSection = ({ total_results }: Props) => {
  const durationTimeSeconds = 4;
  const separatorSymbol = ",";

  return (
    <div className="text-center mb-8 py-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-h1">
        Your Personal Cinema Atlas
      </h1>

      <p className="mt-3 text-2xl sm:text-base md:text-2xl text-text-h1/70">
        Discover, Track, and Find Where to Stream Over{" "}
        <span className="tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary font-semibold">
          <CountUp
            end={total_results}
            duration={durationTimeSeconds}
            separator={separatorSymbol}
          />
        </span>{" "}
        Movies and TV Shows.
      </p>

    </div>
  );
};

export default HeroSection;
