"use client";

import { useState } from "react";
import { LEVEL_KEYS, TOPIC_TREE } from "@/lib/problems";
import { cn } from "@/lib/cn";
import { currentLevel, topicDone, topicProgress, type ProgressStore } from "@/lib/taskProgress";

type Props = {
  store: ProgressStore;
  student: string;
  selected: string;
  onSelect: (topicId: string) => void;
};

/** Хүрээ → сэдвийн мод. Сэдэв бүрт хүрсэн түвшин (Т1–Т4) эсвэл ✓ */
export function TopicTree({ store, student, selected, onSelect }: Props) {
  const selectedStrand = TOPIC_TREE.find((s) => s.topics.some((t) => t.id === selected))?.id;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (id: string) => open[id] ?? id === selectedStrand;

  return (
    <nav aria-label="Сэдвүүд" className="flex flex-col gap-1">
      <h2 className="mb-2 px-3 font-display text-label font-bold uppercase">Сэдвүүд</h2>
      {TOPIC_TREE.map((strand) => {
        const expanded = isOpen(strand.id);
        return (
          <div key={strand.id}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpen((o) => ({ ...o, [strand.id]: !expanded }))}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-body font-medium transition-colors hover:text-accent"
            >
              <span aria-hidden="true" className={cn("inline-block w-3 transition-transform", expanded && "rotate-90")}>
                ›
              </span>
              {strand.index}. {strand.title}
            </button>
            {expanded && (
              <ul className="mb-2 flex flex-col gap-0.5 pl-5">
                {strand.topics.map((t) => {
                  const tp = topicProgress(store, student, t.id);
                  const done = topicDone(tp);
                  const lvl = currentLevel(tp);
                  const started = tp.some((l) => l.some((x) => x.attempts > 0));
                  const active = t.id === selected;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        aria-current={active ? "true" : undefined}
                        onClick={() => onSelect(t.id)}
                        className={cn(
                          "flex w-full cursor-pointer items-start justify-between gap-2 px-3 py-2 text-left text-body leading-display transition-colors",
                          active ? "bg-accent-muted font-medium" : "hover:bg-s-raised",
                        )}
                      >
                        <span>
                          <span className="text-s-sub">{t.index}.</span> {t.title}
                        </span>
                        {(started || done) && (
                          <span
                            className={cn(
                              "mt-0.5 shrink-0 px-1.5 text-eyebrow font-bold",
                              done ? "bg-ok text-foreground" : "bg-surface-black text-accent",
                            )}
                            title={done ? "Бүх түвшин дууссан" : `Хүрсэн түвшин: ${LEVEL_KEYS[lvl]}`}
                          >
                            {done ? "✓" : LEVEL_KEYS[lvl]}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
