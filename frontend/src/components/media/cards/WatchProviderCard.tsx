import { Link } from "react-router-dom";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

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
    <div className="group relative">
      <Link
        to={`/provider/${providerId}?name=${encodeURIComponent(providerName)}&region=${region}`}
        className="block"
      >
        <div
          className="relative w-28 h-28 rounded-2xl overflow-hidden
                     border border-gray-400/30 shadow-lg
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

        <p
          className="mt-2 text-center text-sm text-gray-300/0
                    group-hover:text-white transition-colors
                    truncate max-w-28 text-opacity-100"
        >
          {providerName}
        </p>
      </Link>
    </div>
  );
}
