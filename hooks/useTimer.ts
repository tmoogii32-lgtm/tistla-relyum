"use client";

import { useCallback, useEffect, useState } from "react";

/** Буурах цаг хэмжигч. Ажиллаж байх үед секунд тутам буурч, 0 хүрэхэд зогсоно. */
export function useTimer(seconds: number) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const active = running && left > 0;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [active]);

  const toggle = useCallback(() => {
    if (left > 0) setRunning(!active);
  }, [left, active]);

  const reset = useCallback(() => {
    setRunning(false);
    setLeft(seconds);
  }, [seconds]);

  return { left, running: active, done: left === 0, started: left !== seconds, toggle, reset };
}

export function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
