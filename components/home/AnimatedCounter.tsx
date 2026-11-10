"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLiveStats } from "@/lib/liveStats";

type Props = {
  /** views | students — Apps Script-ээс шууд шинэчлэгдэнэ; static — тогтмол тоо */
  source: "views" | "students" | "static";
  value: number;
};

/**
 * Дэлгэцэнд орох үед 0-ээс гүйдэг тоо (хуучин counter.js).
 * Шууд өгөгдөлтэй үед баруун дээд буланд тархах цагирагтай тэмдэг гарна.
 */
export function AnimatedCounter({ source, value }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { threshold: 0.4 });
  const reduce = useReducedMotion();
  const live = useLiveStats();
  const liveValue = source === "static" ? undefined : live?.[source];
  const target = typeof liveValue === "number" ? liveValue : value;

  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);

  useEffect(() => {
    if (!visible) return;
    const from = shownRef.current;
    const set = (v: number) => {
      shownRef.current = v;
      setShown(v);
    };
    let raf = 0;
    if (reduce || from === target) {
      raf = requestAnimationFrame(() => set(target));
      return () => cancelAnimationFrame(raf);
    }
    // Эхэндээ хурдан, төгсгөлдөө удаан
    const duration = Math.min(2200, 700 + Math.log10(Math.abs(target - from) + 1) * 300);
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      set(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, target, reduce]);

  return (
    <>
      <span ref={ref}>{shown}</span>
      {typeof liveValue === "number" && (
        <span className="absolute top-3 right-5 size-2 bg-accent" title="Шууд шинэчлэгдэж байна">
          <span aria-hidden="true" className="live-ring pointer-events-none absolute -inset-1 border border-accent" />
          <span className="sr-only">шууд шинэчлэгддэг тоо</span>
        </span>
      )}
    </>
  );
}
