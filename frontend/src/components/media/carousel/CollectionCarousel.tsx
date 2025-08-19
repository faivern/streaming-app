import { useEffect, useRef, useState, useCallback } from "react";
import { featuredCollections } from "../../../utils/featuredCollections";
import { searchCollections } from "../../../api/collections";
import CollectionCard from "../cards/CollectionCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

type Found = {
  id: number;
  name: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
};

export default function CollectionCarousel() {
  const [items, setItems] = useState<Found[]>([]);
  const [loading, setLoading] = useState(true);

  // Page-based scrolling
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(3);
  const [page, setPage] = useState(0);

  // Measure how many slides fit (robust against gaps)
  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || track.children.length === 0) return;

    const first = track.children[0] as HTMLElement;
    const second = track.children[1] as HTMLElement | undefined;

    const w1 = first.getBoundingClientRect().width;
    const step = second ? (second.offsetLeft - first.offsetLeft) : w1; // width + gap
    const vw = viewport.clientWidth;

    const ps = Math.max(1, Math.floor((vw + 1) / step)); // how many full slides fit
    setPageSize(ps);
  }, []);

  const pageCount = Math.max(1, Math.ceil(items.length / Math.max(1, pageSize)));

  const clampPage = useCallback(
    (p: number) => Math.min(Math.max(0, p), Math.max(0, pageCount - 1)),
    [pageCount]
  );

  const applyTranslate = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const startIndex = page * pageSize;
    const target = track.children[startIndex] as HTMLElement | undefined;
    track.style.transform = target
      ? `translateX(${-target.offsetLeft}px)`
      : "translateX(0)";
  }, [page, pageSize]);

  // Re-measure on size changes
  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // Keep page valid when pageSize/items change, then position
  useEffect(() => {
    setPage((p) => clampPage(p));
    applyTranslate();
  }, [pageSize, items.length, clampPage, applyTranslate]);

  const prev = () => setPage((p) => clampPage(p - 1));
  const next = () => setPage((p) => clampPage(p + 1));

  // Data load
  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.all(
          featuredCollections.map(async (name) => {
            const data = await searchCollections(name);
            const parsed = typeof data === "string" ? JSON.parse(data) : data;
            const top = parsed?.results?.[0];
            if (!top) return null;
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
  }, []);

  return (
    <section className="md:mx-8 px-4 sm:px-6 lg:px-8 mt-8">
      <h2 className="mb-4 text-2xl font-semibold border-l-4 border-sky-500 pl-2">
        Collections
      </h2>

      <div className="relative -my-3">
        {/* Viewport: py prevents hover-scale clipping; -my-3 cancels added spacing */}
        <div ref={viewportRef} className="overflow-hidden py-3">
          <div
            ref={trackRef}
            className="flex gap-6 transition-transform duration-300 will-change-transform"
            style={{ transform: "translateX(0)" }}
          >
            {(loading ? Array.from({ length: 8 }).map((_, i) => ({ id: i, name: "…" })) : items).map((c: any) => (
              <div key={c.id} className="shrink-0">
                {loading ? (
                  <div className="h-40 w-lg rounded-2xl bg-white/10 animate-pulse" />
                ) : (
                  <CollectionCard
                    id={c.id}
                    title={c.name}
                    backdrop_path={c.backdrop_path}
                    poster_path={c.poster_path}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        <button
          type="button"
          onClick={prev}
          disabled={page === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full
                     bg-gray-900/70 backdrop-blur border border-white/10 text-white
                     hover:bg-gray-800/80 disabled:opacity-40 disabled:cursor-not-allowed hover:cursor-pointer
                     "
          aria-label="Previous"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={page >= pageCount - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full
                     bg-gray-900/70 backdrop-blur border border-white/10 text-white
                     hover:bg-gray-800/80 disabled:opacity-40 disabled:cursor-not-allowed hover:cursor-pointer
                     "
          aria-label="Next"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* Dots by page */}
        <div className="absolute inset-x-0 bottom-0 pb-1">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Go to page ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === page ? "bg-sky-500 w-6" : "bg-gray-500/50 w-2"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
