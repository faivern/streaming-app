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
      className={`rounded-lg object-cover ${className}`}
      src={`${base}/w780${path}`}
      srcSet={`${base}/w780${path} 780w, ${base}/w1280${path} 1280w, ${base}/original${path} 1920w`}
      sizes={sizes}
      alt={alt}
    />
  );
}
