// components/media/shared/Logo.tsx
type LogoProps = {
  path?: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export default function Logo({ path, alt, className = "", sizes, priority = false }: LogoProps) {
  if (!path) return null;
  const base = "https://image.tmdb.org/t/p";
  return (
    <img
      decoding="async"
      className={`object-contain ${className}`}
      src={`${base}/w342${path}`}
      srcSet={`
        ${base}/w185${path} 185w,
        ${base}/w342${path} 342w,
        ${base}/w500${path} 500w`}
      sizes={
        sizes ?? "(max-width: 640px) 160px, (max-width: 1024px) 224px, 256px"
      }
      alt={alt}
      draggable={false}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
