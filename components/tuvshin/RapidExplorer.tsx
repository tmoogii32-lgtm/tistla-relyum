"use client";

import { useState } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { GoalList } from "@/components/ui/Lists";
import { RAPID, type RapidKey } from "@/data/tuvshin";
import { cn } from "@/lib/cn";

/** RAPID бодлогын 5 бүрэлдэхүүн — сонгосон хэсгийн дэлгэрэнгүй */
export function RapidExplorer() {
  const [key, setKey] = useState<RapidKey>("R");
  const index = RAPID.findIndex((r) => r.key === key);
  const data = RAPID[index];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
      <div role="tablist" aria-label="RAPID бүрэлдэхүүн" aria-orientation="vertical" className="flex flex-col gap-3">
        {RAPID.map((r) => {
          const on = r.key === key;
          return (
            <button
              key={r.key}
              type="button"
              role="tab"
              id={`rapid-tab-${r.key}`}
              aria-selected={on}
              aria-controls="rapid-panel"
              onClick={() => setKey(r.key)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 border p-4 text-left transition-colors",
                on ? "border-accent bg-accent-muted" : "border-s-border hover:border-accent",
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center font-display text-label font-bold",
                    on ? "bg-accent text-foreground" : "bg-s-raised",
                  )}
                >
                  {r.key}
                </span>
                <span className="font-medium">{r.name}</span>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          );
        })}
      </div>

      <BracketCard className="bg-s-raised p-6 sm:p-8">
        <div id="rapid-panel" role="tabpanel" aria-labelledby={`rapid-tab-${key}`} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <span className="bg-accent px-3 py-1 text-eyebrow font-bold uppercase text-foreground">Бодлогын Алхам {index + 1}</span>
            <span className="text-eyebrow uppercase text-s-sub">RAPID Framework</span>
          </div>
          <h3 className="font-display text-heading leading-headline font-bold uppercase">{data.title}</h3>
          <p className="text-label font-medium text-s-sub">{data.subtitle}</p>
          <p className="text-body leading-display">{data.desc}</p>
          <div className="border-t border-s-border pt-4">
            <h4 className="mb-3 text-eyebrow font-bold uppercase">Хэрэгжүүлэх практик алхмууд:</h4>
            <GoalList items={data.bullets} />
          </div>
        </div>
      </BracketCard>
    </div>
  );
}
