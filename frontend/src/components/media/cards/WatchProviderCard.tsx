import { Link } from "react-router-dom";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w154";

type WatchProviderCardProps = {
  providerId: number;
  providerName: string;
  logoPath: string;
  region: string;
};

export default function WatchProviderCard({
  providerId,
  providerName,
  logoPath,
  region,
}: WatchProviderCardProps) {
  return (
    <div className="group">
      <Link
        to={`/provider/${providerId}?name=${encodeURIComponent(providerName)}&region=${region}`}
        className="flex flex-col items-center gap-2"
      >
        <div
          className="relative aspect-square w-full max-w-28 rounded-2xl overflow-hidden
                     border border-[var(--border)] shadow-lg
                     transition-all duration-300
                     group-hover:scale-105 group-hover:border-accent-primary/75
                     "
        >
          <img
            src={`${TMDB_IMAGE_BASE}${logoPath}`}
            alt={providerName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <p className="text-center text-xs text-gray-300 font-medium line-clamp-2 w-full max-w-28">
          {providerName}
        </p>
      </Link>
    </div>
  );
}
