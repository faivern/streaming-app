import { useEffect, useRef, useState, useCallback } from "react";

export function useDelayHover(delay: number = 450) {
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onEnter = useCallback(() => {
    clear();
    timerRef.current = window.setTimeout(() => {
      setHovered(true);
      timerRef.current = null;
    }, delay);
  }, [clear, delay]);

  const onLeave = useCallback(() => {
    clear();
    setHovered(false);
  }, [clear]);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  return { hovered, onEnter, onLeave, setHovered };
}
