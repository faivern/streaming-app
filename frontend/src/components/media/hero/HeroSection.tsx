import CountUp from "react-countup";

type Props = {
  total_results: number;
};

const HeroSection = ({ total_results }: Props) => {
  const durationTime = 2.5;
  const separatorSymbol = " ";

  return (
    <div className="text-center mb-8 py-4">
      <h1 className="sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
        Explore{" "}
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
          <CountUp end={total_results} duration={durationTime} separator={separatorSymbol} />
        </span>{" "}
        Movies & TV Shows
      </h1>
    </div>
  );
};

export default HeroSection;
