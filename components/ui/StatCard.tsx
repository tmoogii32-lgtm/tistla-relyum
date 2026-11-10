import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  value: ReactNode;
  label: ReactNode;
  className?: string;
};

/**
 * Тоон үзүүлэлтийн карт: хар дэвсгэр, нэг булан тайрсан accent хүрээ (хуучин design.js §4).
 * Гадна давхарга нь хүрээний өнгө, дотор давхарга нь 1px дотогш дэвсгэр.
 */
export function StatCard({ value, label, className }: Props) {
  return (
    <div className={cn("clip-corner relative bg-accent p-px", className)}>
      <div className="clip-corner relative grid min-h-[4.875rem] grid-cols-[3rem_minmax(0,1fr)] content-center gap-x-4 gap-y-3 bg-surface-black py-[1.125rem] pr-5 text-on-dark">
        <span aria-hidden="true" className="stat-marker row-span-2 -my-[1.125rem] self-stretch" />
        <p className="tabular col-start-2 pt-[0.3rem] font-display text-heading leading-cap font-medium tracking-stat text-accent">
          {value}
        </p>
        <p className="col-start-2 text-eyebrow leading-flat tracking-label uppercase">{label}</p>
      </div>
    </div>
  );
}
