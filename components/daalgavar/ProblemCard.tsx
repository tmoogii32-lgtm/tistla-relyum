"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Form";
import { display, makeChoices, makeExample, toAnswerable, type Problem, type TaskMode, type Topic, type Level } from "@/lib/problems";
import { judge } from "@/lib/judge";
import { cn } from "@/lib/cn";
import { MathText } from "./MathText";
import type { AttemptResult } from "./TaskCard";

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="flex list-decimal flex-col gap-1 pl-5 text-body leading-display">
      {steps.map((s, i) => (
        <li key={i}>
          <MathText text={s} />
        </li>
      ))}
    </ol>
  );
}

/** "Жишээ үзэх" — бодолттой жишээ (тоо нь даалгавраас өөр) */
function Example({ topic, level, seed, onClose }: { topic: Topic; level: Level; seed: string; onClose: () => void }) {
  const [n, setN] = useState(0);
  const ex = makeExample(topic, level, `${seed}|${n}`);
  return (
    <div className="flex flex-col gap-3 border-l-4 border-accent bg-accent-muted p-4" role="region" aria-label="Жишээ бодлого">
      <div className="flex items-center justify-between gap-2">
        <strong className="font-display text-label uppercase">Жишээ</strong>
        <div className="flex gap-3 text-eyebrow uppercase">
          <button type="button" onClick={() => setN((v) => v + 1)} className="cursor-pointer underline-offset-4 hover:underline">
            Өөр жишээ
          </button>
          <button type="button" onClick={onClose} className="cursor-pointer underline-offset-4 hover:underline">
            Хаах ✕
          </button>
        </div>
      </div>
      <p className="text-label">
        <MathText text={ex.text} />
      </p>
      <Steps steps={ex.steps} />
      <p className="text-body">
        Хариу: <strong><MathText text={display(ex.ans)} /></strong>
      </p>
    </div>
  );
}

type Props = {
  topic: Topic;
  level: Level;
  mode: TaskMode;
  problem: Problem;
  /** 1-ээс эхэлсэн дугаар */
  number: number;
  total: number;
  seed: string;
  /** Хариулсан бол үр дүн */
  answered?: AttemptResult;
  isLast: boolean;
  onCheck: (correct: boolean, given: string) => void;
  onNext: () => void;
};

/** Бодлого + хариулт (сонголт эсвэл бичих) + шалгах + бодолт */
export function ProblemCard({ topic, level, mode, problem, number, total, seed, answered, isLast, onCheck, onNext }: Props) {
  const choices = makeChoices(problem, seed);
  const answerable = toAnswerable(problem);
  const useInput = mode === "input" && answerable !== null;
  const right = display(problem.ans);

  const [value, setValue] = useState("");
  const [warn, setWarn] = useState("");
  const [showExample, setShowExample] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Шалгасны дараа үр дүн + бодолт руу фокус шилжинэ (дэлгэц уншигч уншина)
  useEffect(() => {
    if (answered) feedbackRef.current?.focus({ preventScroll: true });
  }, [answered]);

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    if (answered) return;
    if (!value.trim()) return setWarn(useInput ? "Хариугаа бичнэ үү." : "Хариугаа сонгоно уу.");
    if (useInput && answerable) {
      const v = judge(answerable, value);
      if (v === "unreduced") return setWarn("Утга нь зөв, гэхдээ бутархайгаа хураагаарай.");
      if (v === "empty") return setWarn("Хариугаа бичнэ үү.");
      setWarn("");
      return onCheck(v === "ok", value.trim());
    }
    setWarn("");
    onCheck(value === right, value);
  };

  const given = answered?.given ?? value;

  return (
    <div className="flex flex-col gap-6">
      <BracketCard className="flex flex-col gap-4 bg-s-bg p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-title uppercase">
            Бодлого {number}
            <span className="text-s-sub">/{total}</span>
          </h3>
          <button
            type="button"
            aria-expanded={showExample}
            onClick={() => setShowExample((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-2 bg-surface-black px-3 py-2 text-eyebrow font-bold uppercase text-accent transition-colors hover:bg-accent hover:text-foreground"
          >
            <span aria-hidden="true">▶</span> Жишээ үзэх
          </button>
        </div>
        <p className="text-lead leading-display font-medium">
          <MathText text={problem.text} />
        </p>
        {showExample && <Example topic={topic} level={level} seed={seed} onClose={() => setShowExample(false)} />}
      </BracketCard>

      <BracketCard className="bg-s-bg p-6">
        <form onSubmit={submit} autoComplete="off" className="flex flex-col gap-4">
          <h3 className="font-display text-title uppercase">Хариулт</h3>

          {useInput ? (
            <label className="flex max-w-sm items-center gap-3">
              <span className="sr-only">Хариу</span>
              <input
                type="text"
                inputMode={answerable?.type === "frac" ? "text" : "decimal"}
                placeholder={answerable?.type === "frac" ? "жишээ: 3/4" : "Хариу"}
                value={given}
                onChange={(e) => setValue(e.target.value)}
                disabled={!!answered}
                autoFocus
                className={cn(
                  inputClass,
                  "text-lead",
                  answered && (answered.correct ? "border-ok bg-ok/10" : "border-danger bg-danger/10"),
                )}
              />
              {answerable?.type === "num" && answerable.unit && <span className="text-label text-s-sub">{answerable.unit}</span>}
            </label>
          ) : (
            <fieldset className="flex flex-col gap-3" disabled={!!answered}>
              <legend className="sr-only">Хариу сонгох</legend>
              {choices.map((c) => {
                const isRight = c === right;
                const picked = given === c;
                return (
                  <label
                    key={c}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 border px-4 py-3 text-label transition-colors",
                      !answered && "border-s-border hover:border-accent has-checked:border-accent has-checked:bg-accent-muted",
                      answered && isRight && "border-ok bg-ok/10",
                      answered && picked && !isRight && "border-danger bg-danger/10",
                      answered && !picked && !isRight && "border-s-border opacity-60",
                    )}
                  >
                    <input
                      type="radio"
                      name={`answer-${seed}`}
                      value={c}
                      checked={picked}
                      onChange={() => setValue(c)}
                      className="size-4 accent-accent"
                    />
                    <MathText text={c} />
                    {answered && isRight && <span className="ml-auto text-eyebrow font-bold uppercase text-ok">Зөв хариу</span>}
                  </label>
                );
              })}
            </fieldset>
          )}

          <p role="status" className={cn("min-h-5 text-body", warn ? "text-warn" : "")}>
            {warn}
          </p>

          {!answered ? (
            <Actions>
              <Button type="submit">Шалгах</Button>
            </Actions>
          ) : (
            <div className="flex flex-col gap-4">
              <div
                ref={feedbackRef}
                tabIndex={-1}
                className={cn("flex flex-col gap-3 border-l-4 p-4 outline-none", answered.correct ? "border-ok bg-ok/10" : "border-danger bg-danger/10")}
              >
                <strong className="text-label">
                  {answered.correct ? (
                    "Зөв! 🎉"
                  ) : (
                    <>
                      Буруу. Зөв хариу: <MathText text={right} />
                    </>
                  )}
                </strong>
                <span className="text-eyebrow font-bold uppercase text-s-sub">Бодолт</span>
                <Steps steps={problem.steps} />
              </div>
              <Actions>
                <Button onClick={onNext}>{isLast ? "Дүн харах" : "Дараагийн бодлого"}</Button>
              </Actions>
            </div>
          )}
        </form>
      </BracketCard>
    </div>
  );
}
