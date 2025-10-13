import { useEffect, useState } from "react";

export function useVideo(
  mediaType?: "movie" | "tv",
  id?: number,
  shouldFetch: boolean = true // Add control parameter
) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch if explicitly enabled and we have valid params
    if (!shouldFetch || !id || !mediaType) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setVideoUrl(null); // Reset previous URL

    fetch(
      `${
        import.meta.env.VITE_BACKEND_API_URL
      }/api/Movies/${mediaType}/${id}/trailer`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Video data:", data);
        setVideoUrl(data?.url ?? null);
      })
      .catch((err) => {
        console.error("Video fetch error", err);
        setVideoUrl(null);
      })
      .finally(() => setLoading(false));
  }, [mediaType, id, shouldFetch]);

  return { videoUrl, loading };
}
