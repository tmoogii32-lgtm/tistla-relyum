"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TaskTab = { id: string; icon: string; title: string; meta: string; panel: ReactNode };

/**
 * ARIA tablist: сумаар, Home/End-ээр шилжинэ.
 * Нуусан самбаруудыг устгахгүй — даалгаврын явц хадгалагдана.
 */
export function TaskTabs({ tabs, label }: { tabs: TaskTab[]; label: string }) {
  const [selected, setSelected] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const n = tabs.length;
    const next =
      e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    setSelected(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" aria-label={label} className="grid gap-3 md:grid-cols-3">
        {tabs.map((t, i) => {
          const on = i === selected;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-controls={`panel-${t.id}`}
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "flex cursor-pointer items-center gap-4 border px-5 py-4 text-left transition-colors",
                on ? "border-accent bg-surface-black text-on-dark" : "border-s-border hover:border-accent",
              )}
            >
              <span aria-hidden="true" className="text-[1.75rem] leading-none">
                {t.icon}
              </span>
              <span className="flex flex-col gap-1">
                <strong className="font-display text-title leading-headline uppercase">{t.title}</strong>
                <small className={cn("text-eyebrow", on ? "text-on-dark-muted" : "text-s-sub")}>{t.meta}</small>
              </span>
            </button>
          );
        })}
      </div>

      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={i !== selected} className="flex flex-col gap-8">
          {t.panel}
        </div>
      ))}
    </div>
  );
}
