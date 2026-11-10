import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Accent дөрвөлжин тэмдэгтэй жагсаалт (зорилт, шалгуур) */
export function GoalList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-body leading-display">
          <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** ✓ тэмдэгтэй шалгуурын жагсаалт */
export function CheckList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-body leading-display">
          <span aria-hidden="true" className="font-bold text-accent">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Сумтай холбоосын жагсаалт (хуучин `.check-list`, Layout 67) */
export function LinkList({ items }: { items: { href: string; label: string }[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.href} className="flex items-center gap-2 text-lead leading-flat uppercase">
          <span aria-hidden="true" className="size-2 shrink-0 bg-accent" />
          <Link
            href={item.href}
            className="group inline-flex items-center gap-2 border-b border-accent-muted pb-1 transition-colors hover:border-accent hover:text-accent focus-visible:text-accent"
          >
            {item.label}
            <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Хүснэгтийн хүрээ — нарийн дэлгэцэнд хэвтээ scroll */
export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto border border-s-border", className)} tabIndex={0} role="region" aria-label="Хүснэгт">
      {children}
    </div>
  );
}

/** Хүснэгтийн нүдний нийтлэг class */
export const th = "border-b border-s-border bg-s-raised px-4 py-3 text-left align-bottom text-eyebrow font-medium tracking-eyebrow uppercase";
export const td = "border-b border-s-border px-4 py-3 align-top text-body leading-display";
