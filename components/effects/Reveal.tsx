"use client";

import { useRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { useInView } from "@/hooks/useInView";

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Дараалсан элементүүдийг шатлуулах саатал (ms) */
  delay?: number;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

/**
 * Дэлгэцэнд орох үед доороос зөөлөн гарч ирнэ.
 * JS ажиллахгүй эсвэл хөдөлгөөн багасгах тохиргоотой үед шууд харагдана (globals.css).
 */
export function Reveal<T extends ElementType = "div">({
  as,
  delay = 0,
  children,
  style,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref);

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? "shown" : "hidden"}
      style={{ ...style, transitionDelay: shown && delay ? `${delay}ms` : undefined }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
