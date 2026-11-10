"use client";

import { useRef, type ElementType } from "react";
import { useInView } from "@/hooks/useInView";

type Props = {
  as?: ElementType;
  text: string;
  className?: string;
  /** Урт гарчгийг хоёр мөрөнд хуваах */
  breakHalf?: boolean;
};

/**
 * Гарчгийг үг үгээр нь доороос гаргана. Дэлгэц уншигч бүтэн текстийг уншина.
 */
export function SplitHeading({ as: Tag = "h2", text, className, breakHalf = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref, { threshold: 0.3 });
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const breakAt = breakHalf && words.length > 1 ? Math.ceil(words.length / 2) : -1;

  return (
    <Tag ref={ref} className={className} data-mark={shown ? "on" : "off"}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i}>
            {i > 0 && (i === breakAt ? <br /> : " ")}
            <span
              className="inline-block will-change-transform"
              data-reveal={shown ? "shown" : "hidden"}
              style={{ "--reveal-y": "0.35em", transitionDelay: shown ? `${i * 70}ms` : undefined } as React.CSSProperties}
            >
              {w}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
