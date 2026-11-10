"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Элемент дэлгэцэнд орсон эсэх.
 * `once` үед нэг л удаа true болоод ажиглалтаа зогсооно.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { threshold = 0.15, once = true, rootMargin = "0px 0px -5% 0px" } = {},
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[entries.length - 1].isIntersecting;
        if (visible) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, once, rootMargin]);

  return inView;
}
