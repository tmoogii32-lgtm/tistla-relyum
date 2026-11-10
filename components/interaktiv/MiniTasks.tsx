"use client";

import { useCallback, useState } from "react";
import { Reveal } from "@/components/effects/Reveal";
import { BracketCard } from "@/components/ui/BracketCard";
import { Plate } from "@/components/ui/Plate";
import { MINI_TASKS, STRAND_LABELS, type MiniTask, type StrandKey } from "@/data/miniTasks";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/cn";
import { GameDialog } from "./games/GameDialog";

type Scores = Record<string, { best: number; plays: number }>;
const EMPTY: Scores = {};
const isScores = (v: unknown): v is Scores => typeof v === "object" && v !== null && !Array.isArray(v);

function TaskCardItem({ task, best, onOpen }: { task: MiniTask; best?: number; onOpen: () => void }) {
  const pct = best !== undefined ? best / task.points : 0;
  return (
    <article className="group flex h-full items-start gap-5 py-2">
      <Plate className="h-[6.6875rem] w-32 shrink-0 sm:w-40" fillClassName="bg-surface-black">
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center pb-3 font-display text-[2.5rem] text-accent">
          {task.icon}
        </span>
      </Plate>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="font-display text-title leading-headline font-bold uppercase transition-colors group-hover:text-accent">{task.title}</h3>
        <p className="flex flex-wrap items-center gap-2 text-eyebrow font-medium uppercase">
          <span className="bg-accent px-1.5 py-0.5 font-bold text-foreground">{task.points} оноо</span>
          <span className="text-s-sub">{task.meta}</span>
        </p>
        <p className="text-body leading-display text-s-sub">{task.description}</p>
        {best !== undefined && (
          <p className="flex items-center gap-2 text-eyebrow uppercase">
            <span aria-hidden="true" className="h-1 w-16 bg-s-border">
              <span className={cn("block h-full", pct >= 0.8 ? "bg-ok" : "bg-warn")} style={{ width: `${pct * 100}%` }} />
            </span>
            Шилдэг: <b>{best}/{task.points}</b>
          </p>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="self-start text-eyebrow font-bold tracking-eyebrow uppercase underline decoration-accent decoration-2 underline-offset-[0.3em] transition-colors hover:text-accent"
        >
          {best !== undefined ? "Дахин тоглох →" : "Эхлэх →"}
        </button>
      </div>
    </article>
  );
}

/** Сурагчдад зориулсан интерактив мини даалгаврууд — ангиллаар шүүнэ, цонхонд тоглоно */
export function MiniTasks() {
  const [filter, setFilter] = useState<StrandKey | "all">("all");
  const [open, setOpen] = useState<MiniTask | null>(null);
  const [scores, setScores] = useLocalStorage<Scores>("interaktiv-scores-v1", EMPTY, isScores);

  const onScore = useCallback(
    (id: string, score: number) =>
      setScores((s) => ({ ...s, [id]: { best: Math.max(s[id]?.best ?? 0, score), plays: (s[id]?.plays ?? 0) + 1 } })),
    [setScores],
  );

  const tasks = MINI_TASKS.filter((t) => filter === "all" || t.strand === filter);
  const total = MINI_TASKS.reduce((s, t) => s + t.points, 0);
  const earned = MINI_TASKS.reduce((s, t) => s + (scores[t.id]?.best ?? 0), 0);
  const filters: { key: StrandKey | "all"; label: string; count: number }[] = [
    { key: "all", label: "Бүгд", count: MINI_TASKS.length },
    ...(Object.keys(STRAND_LABELS) as StrandKey[]).map((k) => ({ key: k, label: STRAND_LABELS[k], count: MINI_TASKS.filter((t) => t.strand === k).length })),
  ];

  return (
    <div className="grid gap-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <Reveal as="aside" className="flex flex-col gap-4">
        <BracketCard className="flex flex-col gap-4">
          <h3 className="text-eyebrow font-medium tracking-eyebrow uppercase">Даалгаврын ангилал</h3>
          <div role="group" aria-label="Ангиллаар шүүх" className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 px-2 py-1.5 text-left text-label uppercase transition-colors",
                  filter === f.key ? "bg-accent text-foreground" : "hover:text-accent",
                )}
              >
                {f.label}
                <span className="text-eyebrow opacity-70">{f.count}</span>
              </button>
            ))}
          </div>
        </BracketCard>
        <BracketCard accent className="flex flex-col gap-2">
          <p className="text-eyebrow uppercase text-s-sub">Миний нийт оноо</p>
          <p className="font-display text-heading leading-cap text-accent">
            {earned}
            <span className="text-title text-s-sub">/{total}</span>
          </p>
          <p className="text-eyebrow text-s-sub">Даалгавар бүрийн шилдэг оноо нэмэгдэнэ.</p>
        </BracketCard>
      </Reveal>

      <ul className="grid gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((t, i) => (
          <Reveal as="li" key={t.id} delay={(i % 3) * 60}>
            <TaskCardItem task={t} best={scores[t.id]?.best} onOpen={() => setOpen(t)} />
          </Reveal>
        ))}
      </ul>

      <GameDialog task={open} best={open ? scores[open.id]?.best : undefined} onClose={() => setOpen(null)} onScore={onScore} />
    </div>
  );
}
