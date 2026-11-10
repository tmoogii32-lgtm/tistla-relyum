"use client";

import { useState } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { DIAG_QUESTIONS, SELF_ASSESS, SELF_LABELS } from "@/data/diagnostic";
import type { DiagAttempt } from "@/lib/diagnosis";
import { cn } from "@/lib/cn";
import { today } from "@/lib/tracker";
import { MathText } from "./MathText";

type Props = {
  onSubmit: (a: DiagAttempt) => void;
  onCancel?: () => void;
};

const N = DIAG_QUESTIONS.length;

/** Оношлох сорил: эхлээд өөрийн үнэлгээ, дараа нь 30 сонгох даалгавар (нэг нэгээр) */
export function DiagnosticTest({ onSubmit, onCancel }: Props) {
  // step: -1 — өөрийн үнэлгээ, 0..N-1 — асуулт
  const [step, setStep] = useState(-1);
  const [self, setSelf] = useState<number[]>(() => SELF_ASSESS.map(() => 0));
  const [answers, setAnswers] = useState<number[]>(() => DIAG_QUESTIONS.map(() => -1));
  const [warn, setWarn] = useState("");

  const answeredCount = answers.filter((a) => a >= 0).length;

  const submit = () => {
    const missing = answers.filter((a) => a < 0).length;
    if (missing && !confirm(`${missing} даалгавар хариулаагүй байна. Хариулаагүйг буруу гэж тооцно. Илгээх үү?`)) return;
    onSubmit({ date: today(), answers, self });
  };

  if (step === -1) {
    return (
      <BracketCard className="flex flex-col gap-6 bg-s-bg p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">1-р хэсэг · Өөрийгөө үнэлэх</p>
          <p className="text-body text-s-sub">Сорил эхлэхээс өмнө өөрийн чадварыг үнэл. Оноо өгөхгүй — гүйцэтгэлтэй чинь харьцуулна.</p>
        </div>
        {SELF_ASSESS.map((s, i) => (
          <fieldset key={s.strand} className="flex flex-col gap-3">
            <legend className="mb-2 text-label leading-display">
              <b className="font-display uppercase">[{s.strand}]</b> {s.q}
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SELF_LABELS.map((label, v) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center gap-2 border border-s-border px-3 py-2 text-body has-checked:border-accent has-checked:bg-accent-muted"
                >
                  <input
                    type="radio"
                    name={`self-${i}`}
                    checked={self[i] === v + 1}
                    onChange={() => setSelf((x) => x.map((y, j) => (j === i ? v + 1 : y)))}
                    className="size-4 accent-accent"
                  />
                  <span>
                    <b>{v + 1}</b> · {label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <p role="status" className="min-h-5 text-body text-warn">
          {warn}
        </p>
        <Actions>
          <Button
            onClick={() => {
              if (self.some((v) => !v)) return setWarn("4 асуултад бүгдэд нь хариулна уу.");
              setWarn("");
              setStep(0);
            }}
          >
            Даалгавар эхлэх
          </Button>
          {onCancel && (
            <Button variant="link" onClick={onCancel}>
              Болих
            </Button>
          )}
        </Actions>
      </BracketCard>
    );
  }

  const q = DIAG_QUESTIONS[step];
  return (
    <BracketCard className="flex flex-col gap-5 bg-s-bg p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-eyebrow font-medium tracking-eyebrow uppercase">
        <span className="text-accent">2-р хэсэг · Даалгаврууд</span>
        <span>
          Хариулсан {answeredCount}/{N}
        </span>
      </div>

      {/* Даалгаврын навигац */}
      <nav aria-label="Даалгаврууд" className="flex flex-wrap gap-1.5">
        {DIAG_QUESTIONS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            aria-current={i === step ? "step" : undefined}
            aria-label={`${i + 1}-р даалгавар${answers[i] >= 0 ? " (хариулсан)" : ""}`}
            className={cn(
              "grid size-8 cursor-pointer place-items-center border text-eyebrow font-bold transition-colors",
              i === step ? "border-accent bg-accent text-foreground" : answers[i] >= 0 ? "border-ok bg-ok/15" : "border-s-border hover:border-accent",
            )}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      <p className="text-eyebrow uppercase text-s-sub">
        {step + 1}. {q.topic} · {q.k} · {q.b}
      </p>
      <p className="text-lead leading-display font-medium">
        <MathText text={q.q} />
      </p>
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Хариу сонгох</legend>
        {q.choices.map((c, ci) => (
          <label
            key={ci}
            className="flex cursor-pointer items-center gap-3 border border-s-border px-4 py-3 text-label transition-colors hover:border-accent has-checked:border-accent has-checked:bg-accent-muted"
          >
            <input
              type="radio"
              name={`diag-${step}`}
              checked={answers[step] === ci}
              onChange={() => setAnswers((a) => a.map((x, j) => (j === step ? ci : x)))}
              className="size-4 accent-accent"
            />
            <MathText text={c} />
          </label>
        ))}
      </fieldset>

      <Actions>
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          className="cursor-pointer text-label font-medium uppercase transition-colors hover:text-accent"
        >
          ← {step === 0 ? "Өөрийн үнэлгээ" : "Өмнөх"}
        </button>
        {step < N - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Дараах</Button>
        ) : (
          <Button onClick={submit}>Илгээж онош гаргах</Button>
        )}
        {step < N - 1 && answeredCount === N && (
          <Button variant="link" onClick={submit}>
            Илгээх
          </Button>
        )}
      </Actions>
    </BracketCard>
  );
}
