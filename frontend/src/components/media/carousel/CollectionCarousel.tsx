import { useEffect, useState } from "react";
import { featuredCollections } from "../../../utils/featuredCollections";
import { searchCollections } from "../../../api/collections";
import CollectionCard from "../cards/CollectionCard";

type Found = {
  id: number;
  name: string;
  poster_path?: string;
  backdrop_path?: string;
};

export default function CollectionCarousel() {
  const [items, setItems] = useState<Found[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const results = await Promise.all(
          featuredCollections.map(async (name) => {
            const data = await searchCollections(name);

            // Safe parse in case backend returns a JSON string
            const parsed = typeof data === "string" ? JSON.parse(data) : data;

            const top = parsed?.results?.[0];
            if (!top) return null;

            // Normalize to snake_case expected by your components
            return {
              id: top.id,
              name: top.name,
              backdrop_path: top.backdrop_path ?? null,
              poster_path: top.poster_path ?? null,
            } as Found;
          })
        );

        setItems(results.filter(Boolean) as Found[]);
      } catch (e) {
        console.error("Failed to fetch collections:", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="md:mx-8 px-4 sm:px-6 lg:px-8 mt-8">
      <h2 className="mb-4 text-2xl font-semibold border-l-4 border-sky-500 pl-2">Collections</h2>

      {loading ? (
        <div className="flex gap-6 overflow-x-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[320px] h-40 rounded-2xl bg-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : items.length ? (
        <div className="flex gap-6 overflow-x-scroll scrollbar-hide">
          {items
          .sort(()=> Math.random() - 0.5) // Randomize order
          .map((c) => (
            <div key={c.id} className="z-20">
              <CollectionCard
                id={c.id}
                title={c.name}
                backdrop_path={c.backdrop_path}
                poster_path={c.poster_path}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/60">No collections found.</p>
      )}
    </section>
  );
}
