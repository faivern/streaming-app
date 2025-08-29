type LogoProps = {
  path?: string;
  alt?: string;
  className?: string;
  sizes?: string;
};

export default function Logo({ path, alt, className, sizes }: LogoProps) {
  if (!path) {
    return null;
  }
  const base = "https://image.tmdb.org/t/p";
  return (
    <img
      decoding="async"
      className={`rounded-lg object-cover ${className}`}
      src={`${base}/w342${path}`}
      srcSet={`
        ${base}/w185${path} 185w, 
        ${base}/w342${path} 342w, 
        ${base}/w500${path} 500w`}
      sizes={sizes}
      alt={alt}
    />
  );
}
