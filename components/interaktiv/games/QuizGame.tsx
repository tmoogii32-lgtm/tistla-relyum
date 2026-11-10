"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { MathText } from "@/components/daalgavar/MathText";
import { Actions, Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Form";
import { judge } from "@/lib/judge";
import { rng } from "@/lib/problems/core";
import type { BarsVisual, GameDef, QuizQ } from "@/lib/miniGames";
import { cn } from "@/lib/cn";

type Props = {
  def: Extract<GameDef, { kind: "quiz" }>;
  seed: string;
  onFinish: (score: number) => void;
};

/** Жижиг баганан диаграмм (өгөгдлийн утга баганын дээр) */
function Bars({ visual }: { visual: BarsVisual }) {
  const max = Math.max(...visual.values);
  const w = 44;
  const h = 150;
  return (
    <svg viewBox={`0 0 ${visual.values.length * w} ${h + 40}`} className="h-auto w-full max-w-md" role="img" aria-label={visual.labels.map((l, i) => `${l} ${visual.values[i]}`).join(", ")}>
      {visual.values.map((v, i) => {
        const bh = (v / max) * h;
        return (
          <g key={i}>
            <rect x={i * w + 8} y={h - bh + 18} width={w - 16} height={bh} className="fill-accent" />
            <text x={i * w + w / 2} y={h - bh + 12} textAnchor="middle" className="fill-current text-[12px] font-bold">
              {v}
            </text>
            <text x={i * w + w / 2} y={h + 34} textAnchor="middle" className="fill-current text-[12px]">
              {visual.labels[i]}
            </text>
          </g>
        );
      })}
      <line x1="0" x2={visual.values.length * w} y1={h + 18} y2={h + 18} className="stroke-current" />
    </svg>
  );
}

/** Асуулт-хариулт хэлбэрийн тоглоом (сонголт / бичих), хүсвэл хугацаатай */
export function QuizGame({ def, seed, onFinish }: Props) {
  const [questions] = useState<QuizQ[]>(() => Array.from({ length: def.count }, (_, i) => def.make(i, rng(`${seed}|${i}`), rng(`${seed}|shared`))));
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [warn, setWarn] = useState("");
  const [results, setResults] = useState<boolean[]>([]);
  const [left, setLeft] = useState(def.timeLimit ?? 0);
  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const reported = useRef(false);

  const q = questions[idx];
  const answered = results.length > idx;
  const timeUp = def.timeLimit !== undefined && left <= 0;
  const finished = timeUp || idx >= questions.length;
  const score = results.reduce((s, ok, i) => s + (ok ? questions[i].points : 0), 0);
  const maxScore = questions.reduce((s, x) => s + x.points, 0);

  // Хугацаа
  useEffect(() => {
    if (!def.timeLimit || finished) return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [def.timeLimit, finished]);

  // Дуусахад нэг удаа мэдэгдэнэ
  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onFinish(score);
    }
  }, [finished, score, onFinish]);

  useEffect(() => {
    if (answered) feedbackRef.current?.focus({ preventScroll: true });
    else inputRef.current?.focus({ preventScroll: true });
  }, [answered, idx]);

  if (finished) {
    return (
      <div className="flex flex-col gap-3" role="status">
        {timeUp && idx < questions.length && <p className="font-display text-title uppercase text-warn">⏰ Хугацаа дууслаа!</p>}
        <p className="font-display text-impact leading-cap font-bold text-accent">
          {score}
          <span className="text-heading text-s-sub">/{maxScore}</span>
        </p>
        <p className="text-body text-s-sub">
          {results.filter(Boolean).length} зөв · {results.filter((r) => !r).length} буруу
          {idx < questions.length && ` · ${questions.length - idx} бодлого бодогдоогүй`}
        </p>
      </div>
    );
  }

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    if (answered) return;
    if (!value.trim()) return setWarn(q.kind === "input" ? "Хариугаа бичнэ үү." : "Хариугаа сонгоно уу.");
    let ok: boolean;
    if (q.kind === "input") {
      const v = judge(q.answer, value);
      if (v === "empty") return setWarn("Хариугаа бичнэ үү.");
      ok = v === "ok";
    } else ok = value === q.answer;
    setWarn("");
    setResults((r) => [...r, ok]);
  };

  const next = () => {
    setIdx((i) => i + 1);
    setValue("");
  };

  const rightText = q.kind === "input" ? (q.answer.type === "num" ? String(q.answer.answer).replace("-", "−") : "") : q.answer;

  return (
    <form onSubmit={submit} autoComplete="off" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-eyebrow font-medium tracking-eyebrow uppercase">
        <span>
          {idx + 1} / {questions.length} · {q.points} оноо
        </span>
        <span className="flex items-center gap-4">
          {def.timeLimit !== undefined && (
            <span className={cn("tabular font-display text-title", left <= 10 ? "text-danger" : "text-accent")} aria-label={`${left} секунд үлдсэн`}>
              ⏱ {left}с
            </span>
          )}
          <span className="font-display text-title text-accent">{score} оноо</span>
        </span>
      </div>
      <span aria-hidden="true" className="h-1 w-full bg-s-border">
        <span className="block h-full bg-accent transition-[width] duration-300" style={{ width: `${(idx / questions.length) * 100}%` }} />
      </span>

      <p className="text-lead leading-display font-medium">
        <MathText text={q.text} />
      </p>
      {q.visual && <Bars visual={q.visual} />}

      {q.kind === "input" ? (
        <label className="flex max-w-xs items-center gap-3">
          <span className="sr-only">Хариу</span>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            placeholder="Хариу"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={answered}
            className={cn(inputClass, "text-lead", answered && (results[idx] ? "border-ok bg-ok/10" : "border-danger bg-danger/10"))}
          />
        </label>
      ) : (
        <fieldset className={cn("grid gap-3", q.choices.length === 2 ? "grid-cols-2" : "sm:grid-cols-2")} disabled={answered}>
          <legend className="sr-only">Хариу сонгох</legend>
          {q.choices.map((c) => {
            const isRight = c === q.answer;
            const picked = value === c;
            return (
              <label
                key={c}
                className={cn(
                  "flex cursor-pointer items-center gap-3 border px-4 py-3 text-label transition-colors",
                  !answered && "border-s-border hover:border-accent has-checked:border-accent has-checked:bg-accent-muted",
                  answered && isRight && "border-ok bg-ok/10",
                  answered && picked && !isRight && "border-danger bg-danger/10",
                  answered && !picked && !isRight && "border-s-border opacity-60",
                )}
              >
                <input type="radio" name={`q-${seed}-${idx}`} value={c} checked={picked} onChange={() => setValue(c)} className="size-4 accent-accent" />
                <MathText text={c} />
              </label>
            );
          })}
        </fieldset>
      )}

      <p role="status" className="min-h-5 text-body text-warn">
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
            className={cn("flex flex-col gap-1 border-l-4 p-4 outline-none", results[idx] ? "border-ok bg-ok/10" : "border-danger bg-danger/10")}
          >
            <strong className="text-label">
              {results[idx] ? `Зөв! +${q.points} оноо` : `Буруу.${rightText && q.kind === "input" ? ` Зөв хариу: ${rightText}` : ""}`}
            </strong>
            <span className="text-body leading-display">
              <MathText text={q.explain} />
            </span>
          </div>
          <Actions>
            <Button onClick={next}>{idx + 1 === questions.length ? "Дүн харах" : "Дараах"}</Button>
          </Actions>
        </div>
      )}
    </form>
  );
}
