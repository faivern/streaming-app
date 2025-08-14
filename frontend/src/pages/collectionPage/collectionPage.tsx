import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackLink from "../../components/media/breadcrumbs/BackLink";
import CollectionGrid from "../../components/media/grid/CollectionGrid";
import MediaDetailVideoSkeleton from "../../components/media/skeleton/MediaDetailVideoSkeleton";
import Backdrop from "../../components/media/shared/Backdrop";
import { getCollectionById } from "../../api/collections";

type Collection = {
  id: number;
  name: string;
  overview?: string;
  backdrop_path?: string;
  poster_path?: string;
  parts: Array<{
    id: number;
    title?: string;
    poster_path?: string;
    overview?: string;
    release_date?: string;
    vote_average?: number;
    vote_count?: number;
    genre_ids?: number[];
    original_language?: string;
  }>;
};

const CollectionPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCollectionMedia = async () => {
      if (!collectionId) return;
      try {
        setLoading(true);
        setError(false);
        const data = await getCollectionById(Number(collectionId));
        setCollection(data);
      } catch (err) {
        console.error("Failed to fetch collection media:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionMedia();
  }, [collectionId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <BackLink />
        <MediaDetailVideoSkeleton />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mt-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-xl border border-gray-700/30 overflow-hidden shadow-md">
                <div className="aspect-[2/3] w-full bg-gray-700/40" />
                <div className="p-4">
                  <div className="h-4 bg-gray-700/60 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-700/40 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <BackLink />
        <div className="text-red-400 text-center">
          Error loading collection.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
      <BackLink />
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-slate-600/30 shadow-md mb-6">
        <Backdrop
          path={collection.backdrop_path || collection.poster_path || ""}
          alt={collection.name}
          className="w-full h-64 md:h-80 lg:h-96 object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-3xl md:text-4xl font-bold">{collection.name}</h1>
          {collection.overview && (
            <p className="mt-2 text-gray-300 max-w-3xl">
              {collection.overview}
            </p>
          )}
        </div>
      </section>

      {/* Parts */}
      <h2 className="inline-block mb-4 text-gray-100">
        <span className="underline-hover">
          Movies in this collection
          <span className="underline-bar"></span>
        </span>
      </h2>

      <CollectionGrid parts={collection.parts || []} />
    </div>
  );
};

export default CollectionPage;
