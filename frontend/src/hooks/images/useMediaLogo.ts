// hooks/images/useMediaLogo.ts
import { useQuery } from "@tanstack/react-query";
import { getLogoImages } from "../../api/images.api";

export function useMediaLogo(mediaType?: "movie" | "tv", id?: number) {
  return useQuery<string | null>({
    queryKey: ["mediaLogo", mediaType, id],
    enabled: !!mediaType && !!id,
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const data = await getLogoImages(mediaType!, id!);
      const logos = data?.logos ?? [];
      const en = logos.find(l => (l.iso_639_1 ?? "").toLowerCase() === "en");
      return (en ?? logos[0])?.file_path ?? null;
    },
  });
}
