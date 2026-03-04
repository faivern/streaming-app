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
        Your Personal Cinema Atlas
      </h1>
      <p className="mt-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
          <CountUp end={total_results} duration={durationTimeSeconds} separator={separatorSymbol} />
        </span>{" "}
        <span className="text-text-h1">Movies & Shows</span>
      </p>
      <p className="mt-2 text-sm sm:text-base md:text-lg lg:text-xl font-medium text-text-h1/60">
        Discover what to watch, track everything you've seen, and find where
        it's streaming.
      </p>
      <p className="mt-3 text-sm sm:text-base md:text-lg font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary uppercase">
        Start Exploring
      </p>
    </div>
  );
};

export default HeroSection;
