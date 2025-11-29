import { useEffect, useState } from "react";
import { api } from "../api/http/axios";

// Get base URL for fetch calls
const getBaseUrl = () => api.defaults.baseURL || "";

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

    fetch(`${getBaseUrl()}/api/Movies/${mediaType}/${id}/trailer`)
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
