import { useEffect, useState } from "react";

export function useVideo(mediaType: "movie" | "tv", id: number) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !mediaType) return;

    setLoading(true);
    fetch(
      `${
        import.meta.env.VITE_BACKEND_API_URL
      }/api/Movies/${mediaType}/${id}/trailer`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Video data:", data);
        setVideoUrl(data?.url ?? null);
      })
      .catch((err) => console.error("Video fetch error", err))
      .finally(() => setLoading(false));
  }, [mediaType, id]);
  return { videoUrl, loading };
}
