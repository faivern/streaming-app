import { useState } from "react";
import { Film } from "lucide-react";

type BackdropProps = {
  path?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean; // eager-load when true
};

export default function Backdrop({
  path,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
}: BackdropProps) {
  const [imageError, setImageError] = useState(false);

  if (!path || imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-white/5 text-accent-primary aspect-video rounded-lg ${className}`}
        aria-label={alt}
        role="img"
      >
        <Film className="w-1/4 h-1/4" />
      </div>
    );
  }

  const base = "https://image.tmdb.org/t/p";
  return (
    <img
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`rounded-t-lg object-cover aspect-video ${className}`}
      src={`${base}/w1280${path}`}
      srcSet={`${base}/w300${path} 300w, ${base}/w780${path} 780w, ${base}/w1280${path} 1280w, ${base}/original${path} 1920w`}
      sizes={sizes}
      alt={alt}
      onError={() => setImageError(true)}
    />
  );
}
