"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Actions, Button } from "@/components/ui/Button";
import type { MiniTask } from "@/data/miniTasks";
import { STRAND_LABELS } from "@/data/miniTasks";
import { GAMES } from "@/lib/miniGames";
import { GridGame } from "./GridGame";
import { MatchGame } from "./MatchGame";
import { QuizGame } from "./QuizGame";

type Props = {
  task: MiniTask | null;
  best?: number;
  onClose: () => void;
  onScore: (taskId: string, score: number) => void;
};

/** Даалгавар тоглох цонх: заавар → тоглоом → оноо */
export function GameDialog({ task, best, onClose, onScore }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [seed, setSeed] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [prevTask, setPrevTask] = useState(task);

  // Өөр даалгавар нээгдэхэд заавар руу буцна
  if (task !== prevTask) {
    setPrevTask(task);
    setSeed(null);
    setScore(null);
  }

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (task && !d.open) d.showModal();
    if (!task && d.open) d.close();
  }, [task]);

  const start = () => {
    setScore(null);
    setSeed(`${task?.id}|${Date.now()}|${Math.random()}`);
  };

  const finish = useCallback(
    (s: number) => {
      setScore(s);
      if (task) onScore(task.id, s);
    },
    [task, onScore],
  );

  const def = task ? GAMES[task.id] : null;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="game-title"
      className="m-auto max-h-[92svh] w-[min(46rem,calc(100vw-2rem))] overflow-y-auto border border-accent bg-background p-0 text-foreground backdrop:bg-surface-black/70"
    >
      {task && def && (
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center bg-surface-black font-display text-heading text-accent">
                {task.icon}
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-s-sub">
                  {STRAND_LABELS[task.strand]} · {task.points} оноо
                </p>
                <h2 id="game-title" className="font-display text-heading leading-headline font-bold uppercase">
                  {task.title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="cursor-pointer px-2 py-1 text-eyebrow font-bold uppercase hover:text-accent"
              aria-label="Хаах"
            >
              Хаах ✕
            </button>
          </div>

          {!seed ? (
            <div className="flex flex-col gap-5">
              <p className="text-lead leading-display">{task.description}</p>
              <div className="border-l-4 border-accent bg-accent-muted p-4 text-body leading-display">
                <strong className="mb-1 block text-eyebrow uppercase">Заавар</strong>
                {task.rules}
              </div>
              {best !== undefined && <p className="text-body text-s-sub">Таны шилдэг оноо: <b className="text-s-fg">{best}/{task.points}</b></p>}
              <Actions>
                <Button onClick={start}>Эхлэх</Button>
              </Actions>
            </div>
          ) : (
            <>
              {def.kind === "quiz" && <QuizGame key={seed} def={def} seed={seed} onFinish={finish} />}
              {def.kind === "match" && <MatchGame key={seed} def={def} seed={seed} onFinish={finish} />}
              {def.kind === "grid" && <GridGame key={seed} def={def} seed={seed} onFinish={finish} />}
              {score !== null && (
                <div className="flex flex-col gap-4 border-t border-s-border pt-5">
                  <p className="font-display text-title uppercase">
                    {score >= task.points * 0.8 ? "Гайхалтай! 🏆" : score >= task.points * 0.5 ? "Сайн байна! 👍" : "Дахин оролдоод үзээрэй 💪"}{" "}
                    <span className="text-accent">
                      {score}/{task.points} оноо
                    </span>
                  </p>
                  {best !== undefined && <p className="text-body text-s-sub">Шилдэг оноо: {Math.max(best, score)}/{task.points}</p>}
                  <Actions>
                    <Button onClick={start}>Дахин тоглох</Button>
                    <Button variant="link" onClick={() => ref.current?.close()}>
                      Хаах
                    </Button>
                  </Actions>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
