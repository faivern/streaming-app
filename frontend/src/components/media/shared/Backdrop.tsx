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
  if (!path) { 
    return (
      <div
        className={`aspect-video rounded-lg bg-white/5 ${className}`}
        aria-label="Backdrop placeholder"
      />
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
    />
  );
}
