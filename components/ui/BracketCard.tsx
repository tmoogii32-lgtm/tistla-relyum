import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

const CORNERS = [
  "top-0 left-0 -scale-x-100",
  "top-0 right-0",
  "bottom-0 left-0 -scale-100",
  "bottom-0 right-0 -scale-y-100",
];

/** Дөрвөн буланд жижиг ⌐ ¬ шугам зурна (хуучин design.js §2). Эх элемент нь relative байх ёстой. */
export function Brackets({ accent = false }: { accent?: boolean }) {
  return (
    <>
      {CORNERS.map((pos) => (
        <svg
          key={pos}
          className={cn(
            "pointer-events-none absolute size-2.5 overflow-visible fill-none stroke-current",
            accent ? "text-accent" : "text-s-fg",
            pos,
          )}
          viewBox="0 0 10.5 10.5"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0 0.5H10V10.5" />
        </svg>
      ))}
    </>
  );
}

type Props = {
  as?: ElementType;
  children: ReactNode;
  accent?: boolean;
  className?: string;
  id?: string;
};

/** Булангийн хүрээтэй карт */
export function BracketCard({ as: Tag = "div", children, accent, className, id }: Props) {
  return (
    <Tag id={id} className={cn("relative p-6", className)}>
      {children}
      <Brackets accent={accent} />
    </Tag>
  );
}
