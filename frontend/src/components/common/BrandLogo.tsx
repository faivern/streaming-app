import brandEmblem from "../../../public/logo/brandEmblem.svg";

interface BrandLogoProps {
  icon?: boolean;
  gradient?: boolean;
  className?: string;
}

export default function BrandLogo({
  icon = true,
  gradient = false,
  className = "",
}: BrandLogoProps) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      {icon && (
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
      )}
      <span
        className={`text-xl lg:text-2xl whitespace-nowrap leading-none ${
          gradient
            ? "text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary"
            : "text-white"
        }`}
        style={{ fontFamily: "International" }}
      >
        Cinelas
      </span>
    </span>
  );
}
