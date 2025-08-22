type PosterProps = {
  path?: string;
  alt: string;
  className?: string;
  useCustomSize?: boolean; // Add this prop to conditionally disable default aspect ratio
};

export default function Poster({
  path,
  alt,
  className = "",
  useCustomSize = false,
}: PosterProps) {
  if (!path)
    return (
      <div
        className={`${
          useCustomSize ? "" : "aspect-[2/3] rounded-lg"
        } bg-white/5 ${className}`}
      />
    );

  const base = "https://image.tmdb.org/t/p";
  return (
    <img
      loading="lazy"
      decoding="async"
      className={`${
        useCustomSize ? "" : "aspect-[2/3] rounded-t-lg"
      } object-cover ${className}`}
      src={`${base}/w342${path}`}
      srcSet={`${base}/w185${path} 185w, ${base}/w342${path} 342w, ${base}/w500${path} 500w`}
      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
      alt={alt}
    />
  );
}
