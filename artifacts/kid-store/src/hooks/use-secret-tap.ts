import { useRef, useCallback } from "react";
import { useLocation } from "wouter";

const REQUIRED_TAPS = 5;
const RESET_MS = 2000;

export function useSecretTap() {
  const [, navigate] = useLocation();
  const tapsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      tapsRef.current += 1;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        tapsRef.current = 0;
      }, RESET_MS);

      if (tapsRef.current >= REQUIRED_TAPS) {
        tapsRef.current = 0;
        if (timerRef.current) clearTimeout(timerRef.current);
        navigate("/admin");
      }
    },
    [navigate],
  );

  return handleTap;
}
