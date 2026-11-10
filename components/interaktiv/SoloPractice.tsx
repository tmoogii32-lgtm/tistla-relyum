"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { PASS_SCORE } from "@/data/levels";
import { SOLO, type SoloItem, type SoloTopic } from "@/data/interaktiv";
import { answerText, judge } from "@/lib/judge";
import { cn } from "@/lib/cn";
import { AnswerField, Feedback, Tag, type Tone } from "./shared";

type Result = { item: SoloItem; correct: boolean; clean: boolean };

/** Сэдэв сонгох товчнууд */
function TopicPicker({ current, onPick }: { current?: string; onPick: (t: SoloTopic) => void }) {
  return (
    <div role="group" aria-label="Сэдэв сонгох" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {SOLO.map((t) => {
        const on = t.id === current;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(t)}
            className={cn(
              "flex cursor-pointer items-center gap-3 border px-4 py-3 text-left font-display text-label font-bold uppercase transition-colors",
              on ? "border-accent bg-accent text-foreground" : "border-s-border hover:border-accent",
            )}
          >
            <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center bg-surface-black font-sans text-lead text-accent">
              {t.icon}
            </span>
            {t.title}
          </button>
        );
      })}
    </div>
  );
}

function Progress({ label, done, total }: { label: string; done: number; total: number }) {
  return (
    <div className="flex items-center gap-4 text-eyebrow font-medium tracking-eyebrow uppercase">
      <span className="shrink-0">{label}</span>
      <span aria-hidden="true" className="h-1 flex-1 bg-s-border">
        <span className="block h-full bg-accent transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} />
      </span>
    </div>
  );
}

/** Нэг даалгавар: 2 оролдлого, зөвлөгөө, бодолт */
function SoloQuestion({ item, name, isLast, onFinish, onNext }: {
  item: SoloItem;
  name: string;
  isLast: boolean;
  onFinish: (r: Result) => void;
  onNext: () => void;
}) {
  const [value, setValue] = useState("");
  const [hints, setHints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: Tone; text: string } | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (done) nextRef.current?.focus();
  }, [done]);

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    if (done) return;
    const r = judge(item, value);
    if (r === "empty") return setFeedback({ tone: "neutral", text: "Хариугаа оруулна уу." });
    if (r === "unreduced") return setFeedback({ tone: "warn", text: "Утга нь зөв, гэхдээ бутархайгаа хураагаарай." });
    const tries = attempts + 1;
    setAttempts(tries);
    if (r === "ok" || tries >= 2) {
      const correct = r === "ok";
      setDone(true);
      // Анхны оролдлогоор, зөвлөгөөгүй зөв бол "цэвэр"
      onFinish({ item, correct, clean: correct && tries === 1 && hints === 0 });
      setFeedback({
        tone: correct ? "ok" : "bad",
        text: `${correct ? "Зөв! " : `Зөв хариу: ${answerText(item)}. `}Бодолт: ${item.sol}`,
      });
    } else {
      setFeedback({ tone: "bad", text: "Буруу байна. Дахин нэг оролд эсвэл зөвлөгөө ав." });
    }
  };

  const hintLabel =
    hints === 0 ? `Зөвлөгөө (${item.hints.length})` : hints < item.hints.length ? `Дахин зөвлөгөө (${item.hints.length - hints})` : "Зөвлөгөө дууссан";

  return (
    <BracketCard className="bg-s-raised p-6 sm:p-8">
      <form onSubmit={submit} autoComplete="off" className="flex flex-col gap-5">
        <div>
          <Tag>
            {item.k} × {item.b}
          </Tag>
        </div>
        <p className="text-lead leading-display font-medium">{item.q}</p>
        <AnswerField item={item} name={name} value={value} onChange={setValue} disabled={done} autoFocus />
        <Actions>
          <Button type="submit" disabled={done}>
            Шалгах
          </Button>
          <Button onClick={() => setHints((h) => Math.min(h + 1, item.hints.length))} disabled={done || hints >= item.hints.length}>
            {hintLabel}
          </Button>
          {done && (
            <button
              ref={nextRef}
              type="button"
              onClick={onNext}
              className="cursor-pointer font-display text-title font-bold uppercase text-accent underline-offset-4 hover:underline"
            >
              {isLast ? "Дүн харах →" : "Дараагийн даалгавар →"}
            </button>
          )}
        </Actions>
        <Feedback tone={feedback?.tone}>{feedback?.text}</Feedback>
        {hints > 0 && (
          <ul className="flex flex-col gap-2">
            {item.hints.slice(0, hints).map((h) => (
              <li key={h} className="border-l-2 border-accent pl-3 text-body leading-display">
                💡 {h}
              </li>
            ))}
          </ul>
        )}
      </form>
    </BracketCard>
  );
}

function SoloSummary({ topic, results, onRetry }: { topic: SoloTopic; results: Result[]; onRetry: () => void }) {
  const correct = results.filter((r) => r.correct).length;
  const clean = results.filter((r) => r.clean).length;
  const passed = correct >= PASS_SCORE;
  return (
    <BracketCard accent className={cn("flex flex-col gap-5 p-6 sm:p-8", passed ? "bg-ok/10" : "bg-danger/10")}>
      <p className={cn("font-display text-impact leading-cap font-bold", passed ? "text-ok" : "text-danger")}>
        {correct} / {topic.items.length}
      </p>
      <h4 className="font-display text-heading leading-headline font-bold uppercase">
        {passed ? `Сайн байна! "${topic.title}" сэдвийг эзэмшжээ.` : `"${topic.title}" сэдэвт хоцрогдол байна.`}
      </h4>
      <p className="text-body leading-display text-s-sub">
        {passed
          ? `Зөвлөгөөгүй, нэг оролдлогоор ${clean} даалгавар бодсон. Дараагийн сэдэв рүү шилжээрэй.`
          : "Буруу бодсон даалгаврын бодолтыг уншаад дахин оролдоорой. Хосоороо дасгалжуулах даалгавар ч тус болно."}
      </p>
      <ul className="flex flex-col gap-3">
        {results.map((r, i) => (
          <li key={i} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 text-body leading-display">
            <span aria-hidden="true" className={cn("font-bold", r.correct ? "text-ok" : "text-danger")}>
              {r.correct ? "✓" : "✗"}
            </span>
            <span>
              {i + 1}. {r.item.q}
              <span className="sr-only">{r.correct ? " — зөв" : " — буруу"}</span>
              {!r.correct && <small className="block text-s-sub">Бодолт: {r.item.sol}</small>}
            </span>
          </li>
        ))}
      </ul>
      <Actions>
        <Button onClick={onRetry}>Дахин бодох</Button>
        <Button href="/hotsrogdol">Хоцрогдлыг тооцох-д бүртгэх</Button>
      </Actions>
    </BracketCard>
  );
}

/** Ганцаарчилсан: сэдэв сонгоод 5 даалгавар, 5-аас 4 зөв бол эзэмшсэн */
export function SoloPractice() {
  const [topic, setTopic] = useState<SoloTopic | null>(null);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  // Нэг сэдвийг дахин сонгоход асуултыг шинэчлэх түлхүүр
  const [run, setRun] = useState(0);

  const start = (t: SoloTopic) => {
    setTopic(t);
    setIdx(0);
    setResults([]);
    setRun((r) => r + 1);
  };

  return (
    <div className="flex flex-col gap-6" aria-live="polite">
      <TopicPicker current={topic?.id} onPick={start} />
      {!topic && <p className="text-body text-s-sub">Дээрээс сэдвээ сонгоно уу.</p>}
      {topic && idx < topic.items.length && (
        <>
          <Progress label={`${topic.title} · ${idx + 1} / ${topic.items.length}`} done={idx} total={topic.items.length} />
          <SoloQuestion
            key={`${run}-${idx}`}
            item={topic.items[idx]}
            name={`solo-${topic.id}-${idx}`}
            isLast={idx + 1 === topic.items.length}
            onFinish={(r) => setResults((rs) => [...rs, r])}
            onNext={() => setIdx((i) => i + 1)}
          />
        </>
      )}
      {topic && idx >= topic.items.length && <SoloSummary topic={topic} results={results} onRetry={() => start(topic)} />}
    </div>
  );
}
