import CountUp from "react-countup";

type Props = {
  total_results: number;
};

const HeroSection = ({ total_results }: Props) => {
  const durationTimeSeconds = 4;
  const separatorSymbol = " ";

  return (
    <div className="text-center mb-8 py-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-h1">
        Explore Your Cinema Atlas
      </h1>
      <p className="mt-2 text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-text-h1/70">
        Discover{" "}
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
          <CountUp end={total_results} duration={durationTimeSeconds} separator={separatorSymbol} />
        </span>{" "}
        movies and shows across every streaming platform.
      </p>
    </div>
  );
};

export default HeroSection;
