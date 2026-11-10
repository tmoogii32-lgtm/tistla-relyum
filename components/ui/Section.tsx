import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Surface = "light" | "muted" | "dark";

type SectionProps = {
  children: ReactNode;
  surface?: Surface;
  id?: string;
  /** Дээд доод зай хагас */
  tight?: boolean;
  className?: string;
  "aria-label"?: string;
};

/** Хуудасны хэсэг — гадаргуу (цайвар/харанхуй) ба стандарт зай. */
export function Section({ children, surface = "light", id, tight, className, ...rest }: SectionProps) {
  return (
    <section
      id={id}
      data-surface={surface}
      className={cn(
        "relative overflow-hidden px-(--gutter)",
        tight ? "py-[calc(var(--section-y)/2)]" : "py-(--section-y)",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative mx-auto w-full max-w-site", className)}>{children}</div>;
}
