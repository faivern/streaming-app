import { Link } from "react-router-dom";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/original";

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
          className="relative h-48 w-48 rounded-2xl overflow-hidden
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

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-center text-sm text-white font-medium truncate">
              {providerName}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
