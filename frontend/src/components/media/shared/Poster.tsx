import { useState } from "react";
import mediaPlaceholder from "../../../images/media-placeholder.png";

type PosterProps = {
  path?: string;
  alt: string;
  className?: string;
  useCustomSize?: boolean; // Add this prop to conditionally disable default aspect ratio
  priority?: boolean; // eager-load when true
};

export default function Poster({
  path,
  alt,
  className = "",
  useCustomSize = false,
  priority = false,
}: PosterProps) {
  const [imageError, setImageError] = useState(false);

  // If no path or image failed to load, show placeholder
  if (!path || imageError) {
    return (
      <img
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`${
          useCustomSize ? "" : "aspect-[2/3] rounded-lg"
        } object-cover bg-white/5 ${className}`}
        src={mediaPlaceholder}
        alt={alt}
        onError={() => setImageError(true)}
      />
    );
  }

  const base = "https://image.tmdb.org/t/p";
  return (
    <img
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`${
        useCustomSize ? "" : "aspect-[2/3] rounded-t-lg"
      } object-cover ${className}`}
      src={`${base}/w342${path}`}
      srcSet={`${base}/w185${path} 185w, ${base}/w342${path} 342w, ${base}/w500${path} 500w`}
      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
      alt={alt}
      onError={() => setImageError(true)}
    />
  );
}
