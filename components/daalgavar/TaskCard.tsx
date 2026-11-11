"use client";

import { LEVEL_KEYS, PROBLEMS_PER_TASK, TASK_MODES, TASK_PASS, type Problem } from "@/lib/problems";
import { cn } from "@/lib/cn";
import type { TaskProgress } from "@/lib/taskProgress";

export type AttemptResult = { correct: boolean; given: string; problem: Problem };

type Props = {
  level: number;
  index: number;
  progress: TaskProgress;
  /** Одоогийн (дуусаагүй эсвэл дөнгөж дууссан) оролдлогын хариунууд */
  results: AttemptResult[];
  active: boolean;
  onSelect: () => void;
};

/** "Т1-Даалгавар 1" карт: явц, цэгүүд, зорилго */
export function TaskCard({ level, index, progress, results, active, onSelect }: Props) {
  const done = results.length;
  const correct = results.filter((r) => r.correct).length;
  const wrong = done - correct;
  const need = Math.max(0, TASK_PASS - correct);
  const impossible = wrong > PROBLEMS_PER_TASK - TASK_PASS;
  const mode = TASK_MODES[index] === "choice" ? "Сонголттой" : "Хариугаа бичих";

  let goal: string;
  if (progress.passed && done === 0) goal = `✓ Тэнцсэн · шилдэг дүн ${progress.best}/${PROBLEMS_PER_TASK}`;
  else if (done === PROBLEMS_PER_TASK) goal = correct >= TASK_PASS ? `✓ Тэнцлээ (${correct}/${PROBLEMS_PER_TASK})` : `Тэнцсэнгүй (${correct}/${PROBLEMS_PER_TASK}) — дахин оролдоно`;
  else if (impossible) goal = "Энэ оролдлогоор тэнцэх боломжгүй — дуусгаад дахин оролдоорой";
  else goal = `Зорилго биелэхэд ${need} бодлого зөв бодох үлдлээ`;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer flex-col gap-3 border p-4 text-left transition-colors",
        active ? "border-accent bg-accent-muted" : "border-s-border bg-s-bg hover:border-accent",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex flex-col gap-0.5">
          <strong className="font-display text-label uppercase">
            {LEVEL_KEYS[level]}-Даалгавар {index + 1}
          </strong>
          <small className="text-eyebrow uppercase text-s-sub">{mode}</small>
        </span>
        <span className="flex items-center gap-2 text-body font-medium">
          {progress.passed && (
            <span className="bg-ok px-1.5 text-eyebrow font-bold text-foreground" title="Тэнцсэн">
              ✓
            </span>
          )}
          {done}/{PROBLEMS_PER_TASK}
        </span>
      </div>
      <span aria-hidden="true" className="h-1 w-full bg-s-border">
        <span className="block h-full bg-accent transition-[width] duration-300" style={{ width: `${(done / PROBLEMS_PER_TASK) * 100}%` }} />
      </span>
      <span className="text-eyebrow text-s-sub">
        Бодсон <b className="text-s-fg">{done}</b> · Зөв <b className="text-ok">{correct}</b> · Буруу <b className="text-danger">{wrong}</b>
        {progress.attempts > 0 && <> · {progress.attempts} оролдлого</>}
      </span>
      <span aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: PROBLEMS_PER_TASK }, (_, i) => (
          <span
            key={i}
            className={cn("size-2.5 rounded-full", i < done ? (results[i].correct ? "bg-ok" : "bg-danger") : "bg-s-border")}
          />
        ))}
      </span>
      <span
        className={cn(
          "px-2 py-1.5 text-eyebrow leading-display",
          progress.passed || (done === PROBLEMS_PER_TASK && correct >= TASK_PASS) ? "bg-ok/10 text-ok" : impossible ? "bg-danger/10 text-danger" : "bg-accent-muted",
        )}
      >
        {goal}
      </span>
    </button>
  );
}
