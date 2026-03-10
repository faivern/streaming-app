// import brandEmblem from "../../../public/logo/cinelas-prototype-1.svg";

interface BrandLogoProps {
  icon?: boolean;
  gradient?: boolean;
  className?: string;
}

export default function BrandLogo({
  icon: _icon = true,
  gradient: _gradient = false,
  className = "",
}: BrandLogoProps) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      {/* {_icon && (
        <span
          aria-label="brandEmblem"
          role="img"
          className="h-10 w-10 block bg-gradient-to-r from-accent-primary to-accent-secondary flex-shrink-0"
          style={{
            WebkitMaskImage: `url(${brandEmblem})`,
            maskImage: `url(${brandEmblem})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      )} */}
      <span
        className="text-xl lg:text-2xl whitespace-nowrap leading-none text-white"
        style={{ fontFamily: "International", WebkitFontSmoothing: "antialiased" }}
      >
        Cinelas
      </span>
    </span>
  );
}
