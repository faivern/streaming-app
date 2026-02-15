import { useEffect, useRef, useState, useCallback } from "react";

export function useDelayHover(
  enterDelay: number = 450,
  leaveDelay: number = 150,
) {
  const [hovered, setHovered] = useState(false);
  const enterTimerRef = useRef<number | null>(null);
  const leaveTimerRef = useRef<number | null>(null);

  const clearEnter = useCallback(() => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
  }, []);

  const clearLeave = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const onEnter = useCallback(() => {
    clearEnter();
    clearLeave();
    enterTimerRef.current = window.setTimeout(() => {
      setHovered(true);
    }, enterDelay);
  }, [clearEnter, clearLeave, enterDelay]);

  const onLeave = useCallback(() => {
    clearEnter();
    leaveTimerRef.current = window.setTimeout(() => {
      setHovered(false);
    }, leaveDelay);
  }, [clearEnter, clearLeave, leaveDelay]);

  useEffect(() => {
    return () => {
      clearEnter();
      clearLeave();
    };
  }, [clearEnter, clearLeave]);

  return { hovered, onEnter, onLeave, setHovered };
}
