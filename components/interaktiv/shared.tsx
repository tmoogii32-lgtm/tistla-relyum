"use client";

import type { ReactNode } from "react";
import { inputClass } from "@/components/ui/Form";
import type { Answerable } from "@/data/interaktiv";
import { formatTime, useTimer } from "@/hooks/useTimer";
import { cn } from "@/lib/cn";

/** Жижиг хоёрдогч товч (таймер, станц) */
export const miniBtn =
  "inline-flex min-h-10 cursor-pointer items-center justify-center border border-accent px-4 text-eyebrow font-medium tracking-eyebrow uppercase transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit";

/** "Журам × Хэрэглэх" маягийн шошго */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block border border-s-border px-2 py-1 text-eyebrow font-medium tracking-eyebrow uppercase text-s-sub">
      {children}
    </span>
  );
}

export type Tone = "neutral" | "ok" | "warn" | "bad";

const TONE: Record<Tone, string> = {
  neutral: "text-s-sub",
  ok: "border-l-4 border-ok bg-ok/10 text-s-fg",
  warn: "border-l-4 border-warn bg-warn/10 text-s-fg",
  bad: "border-l-4 border-danger bg-danger/10 text-s-fg",
};

/** Хариуны үр дүнгийн мөр (дэлгэц уншигчид мэдэгдэнэ) */
export function Feedback({ tone = "neutral", children }: { tone?: Tone; children?: ReactNode }) {
  return (
    <p role="status" className={cn("min-h-6 text-body leading-display", Boolean(children) && tone !== "neutral" && "px-4 py-3", TONE[tone])}>
      {children}
    </p>
  );
}

type AnswerFieldProps = {
  item: Answerable;
  name: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

/** Хариу оруулах: тоо / бутархай — текст талбар, сонголт — radio */
export function AnswerField({ item, name, value, onChange, disabled, autoFocus }: AnswerFieldProps) {
  if (item.type === "choice") {
    return (
      <fieldset className="grid gap-2 sm:grid-cols-2" disabled={disabled}>
        <legend className="sr-only">Хариу сонгох</legend>
        {item.choices.map((c, i) => (
          <label
            key={c}
            className="flex cursor-pointer items-center gap-3 border border-s-border px-4 py-3 text-body has-checked:border-accent has-checked:bg-accent-muted"
          >
            <input
              type="radio"
              name={name}
              value={String(i)}
              checked={value === String(i)}
              onChange={(e) => onChange(e.target.value)}
              autoFocus={autoFocus && i === 0}
              className="accent-accent"
            />
            <span>{c}</span>
          </label>
        ))}
      </fieldset>
    );
  }
  return (
    <label className="flex max-w-xs items-center gap-3">
      <span className="sr-only">Хариу</span>
      <input
        type="text"
        name={name}
        autoComplete="off"
        inputMode={item.type === "frac" ? "text" : "decimal"}
        placeholder={item.type === "frac" ? "жишээ: 3/4" : "Хариу"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(inputClass, "text-lead disabled:opacity-60")}
      />
      {item.unit && <span className="text-label text-s-sub">{item.unit}</span>}
    </label>
  );
}

/** Буурах таймер: хугацаа дуусахад улаан болж, дэлгэц уншигчид мэдэгдэнэ */
export function Timer({ seconds, label }: { seconds: number; label: string }) {
  const { left, running, done, started, toggle, reset } = useTimer(seconds);
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 border px-4 py-3",
        done ? "border-danger bg-danger/10" : "border-s-border",
      )}
    >
      <span className="text-eyebrow font-medium tracking-eyebrow uppercase text-s-sub">{label}</span>
      <span className={cn("tabular font-display text-heading leading-cap font-medium", done ? "text-danger" : "text-accent")}>
        {formatTime(left)}
      </span>
      <div className="ml-auto flex gap-2">
        <button type="button" onClick={toggle} disabled={done} className={miniBtn}>
          {running ? "Түр зогсоох" : started ? "Үргэлжлүүлэх" : "Эхлүүлэх"}
        </button>
        <button type="button" onClick={reset} className={miniBtn}>
          Шинэчлэх
        </button>
      </div>
      <span role="status" className="sr-only">
        {done ? `${label}: хугацаа дууслаа` : ""}
      </span>
    </div>
  );
}

/** Даалгаврын хэсгийн толгой: гарчиг, тайлбар, мэдлэг × Блум */
export function TaskHead({ title, text, knowledge, bloom }: { title: string; text: string; knowledge: string; bloom: string }) {
  return (
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
      <div className="flex max-w-2xl flex-col gap-2">
        <h3 className="font-display text-heading leading-headline font-bold uppercase">{title}</h3>
        <p className="text-body leading-display text-s-sub">{text}</p>
      </div>
      <ul className="flex shrink-0 flex-col gap-1 text-body">
        <li>
          Мэдлэг: <strong>{knowledge}</strong>
        </li>
        <li>
          Блум: <strong>{bloom}</strong>
        </li>
      </ul>
    </div>
  );
}
