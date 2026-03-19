import { useEffect } from "react";

export function usePreloadImages(urls: string[]) {
  useEffect(() => {
    if (urls.length === 0) return;
    const images = urls.map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });
    return () => {
      images.forEach((img) => {
        img.src = "";
      });
    };
  }, [urls]);
}
