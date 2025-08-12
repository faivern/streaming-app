type PosterProps = { path?: string; alt: string; className?: string };

export default function Poster({ path, alt, className = "" }: PosterProps) {
  if (!path)
    return (
      <div className={`aspect-[2/3] rounded-lg bg-white/5 ${className}`} />
    );

  const base = "https://image.tmdb.org/t/p";
  return (
    <img
      loading="lazy"
      decoding="async"
      className={`aspect-[2/3] rounded-t-lg object-cover ${className}`}
      src={`${base}/w342${path}`}
      srcSet={`${base}/w185${path} 185w, ${base}/w342${path} 342w, ${base}/w500${path} 500w`}
      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
      alt={alt}
    />
  );
}
