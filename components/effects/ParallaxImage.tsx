"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  src: string;
  alt?: string;
  priority?: boolean;
  /** Хөдлөх хүрээ (rem) — дээш доош */
  range?: number;
};

/**
 * Хэсгийн фон зураг — хуудаснаас удаан хөдөлж гүнзгий харагдана.
 * Эх элемент нь `relative overflow-hidden` байх ёстой.
 */
export function ParallaxImage({ src, alt = "", priority = false, range = 3.75 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || reduce) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = host.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      el.style.transform = `translate3d(0, ${(-(p - 0.5) * 2 * range).toFixed(3)}rem, 0)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      el.style.transform = "";
    };
  }, [reduce, range]);

  return (
    <div
      ref={ref}
      aria-hidden={alt ? undefined : true}
      className="absolute inset-x-0 will-change-transform"
      style={{ top: `-${range}rem`, bottom: `-${range}rem` }}
    >
      <Image src={src} alt={alt} fill priority={priority} sizes="100vw" className="object-cover" />
    </div>
  );
}
