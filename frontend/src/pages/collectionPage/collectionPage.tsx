import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackLink from "../../components/media/breadcrumbs/BackLink";
import MediaDetailVideoSkeleton from "../../components/media/skeleton/MediaDetailVideoSkeleton";
import HeroCollection from "../../components/media/hero/HeroCollection";
import CollectionPartsSection from "../../components/media/grid/CollectionPartsSection";
import { getCollectionById } from "../../api/collections.api";

type Collection = {
  id: number;
  name: string;
  overview?: string;
  backdrop_path?: string;
  poster_path?: string;
  parts: Array<any>;
  vote_average?: number;
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
      <div className="max-w-7xl mx-auto px-4 py-8 mt-navbar-offset">
        <BackLink />
        <MediaDetailVideoSkeleton />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6 mt-6">
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
      <div className="">
        <BackLink />
        <div className="text-red-400 text-center">
          Error loading collection.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-navbar-offset">
      <BackLink />
      <HeroCollection collection={collection} />
      <CollectionPartsSection parts={collection.parts} />
    </div>
  );
};

export default CollectionPage;
