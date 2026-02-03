import CountUp from "react-countup";

type Props = {
  total_results: number;
};

const HeroSection = ({ total_results }: Props) => {
  const durationTimeSeconds = 4;
  const separatorSymbol = " ";

  return (
    <div className="text-center mb-8 py-4">
      <h1 className="sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-text-h1">
        Explore{" "}
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
          <CountUp end={total_results} duration={durationTimeSeconds} separator={separatorSymbol} />
        </span>{" "}
        Movies & TV Shows
      </h1>
    </div>
  );
};

export default HeroSection;
