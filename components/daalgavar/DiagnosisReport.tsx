"use client";

import Link from "next/link";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { TableWrap } from "@/components/ui/Lists";
import { BLOOM, DIAG_QUESTIONS, KNOWLEDGE, MASTERED, PARTIAL, type Practice } from "@/data/diagnostic";
import { STATUS_LABEL, diagnose, statusOf, type DiagAttempt, type Status } from "@/lib/diagnosis";
import { cn } from "@/lib/cn";
import { MathText } from "./MathText";

const TONE: Record<Status, { text: string; bg: string; bar: string; border: string }> = {
  ok: { text: "text-ok", bg: "bg-ok/10", bar: "bg-ok", border: "border-ok" },
  mid: { text: "text-warn", bg: "bg-warn/10", bar: "bg-warn", border: "border-warn" },
  low: { text: "text-danger", bg: "bg-danger/10", bar: "bg-danger", border: "border-danger" },
};

function Bar({ label, pct, sub }: { label: string; pct: number; sub?: string }) {
  const s = statusOf(pct);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-body">
        <span className="font-medium">
          {label}
          {sub && <span className="ml-2 text-eyebrow text-s-sub">{sub}</span>}
        </span>
        <span className={cn("font-display text-label font-bold", TONE[s].text)}>
          {pct}% · {STATUS_LABEL[s]}
        </span>
      </div>
      <span aria-hidden="true" className="h-2 w-full bg-s-border">
        <span className={cn("block h-full", TONE[s].bar)} style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

function PracticeLink({ p, onOpenTopic }: { p: Practice; onOpenTopic: (id: string) => void }) {
  const cls = "inline-flex items-center gap-1 border border-accent px-2 py-1 text-eyebrow font-bold uppercase transition-colors hover:bg-accent hover:text-foreground";
  if (p.kind === "topic")
    return (
      <button type="button" onClick={() => onOpenTopic(p.topicId)} className={cn(cls, "cursor-pointer")}>
        ▶ {p.label}
      </button>
    );
  return (
    <Link href={p.href} className={cls}>
      ↗ {p.label}
    </Link>
  );
}

type Props = {
  attempt: DiagAttempt;
  previous?: DiagAttempt;
  studentName?: string;
  onRetake: () => void;
  onOpenTopic: (topicId: string) => void;
};

/** Оношийн тайлан: төлөв, хүрээ/мэдлэг/Блум, матриц, давтах сэдэв, нөхөх төлөвлөгөө */
export function DiagnosisReport({ attempt, previous, studentName, onRetake, onOpenTopic }: Props) {
  const d = diagnose(attempt);
  const prev = previous ? diagnose(previous) : null;
  const tone = TONE[d.status];

  return (
    <div className="flex flex-col gap-6">
      {/* Нийт дүн */}
      <BracketCard accent className={cn("grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center", tone.bg)}>
        <div className="flex flex-col items-start gap-2">
          <p className="text-eyebrow uppercase text-s-sub">
            {studentName ? `${studentName} · ` : ""}
            {attempt.date}
          </p>
          <p className={cn("font-display text-impact leading-cap font-bold", tone.text)}>{d.pct}%</p>
          <p className="text-body text-s-sub">
            {d.earned}/{d.possible} зөв
            {prev && (
              <span className={cn("ml-2 font-bold", d.pct >= prev.pct ? "text-ok" : "text-danger")}>
                {d.pct >= prev.pct ? "▲" : "▼"} {Math.abs(d.pct - prev.pct)}% (өмнөх {prev.pct}%)
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className={cn("font-display text-heading leading-headline font-bold uppercase", tone.text)}>
            {d.status === "ok" ? "Хоцрогдолгүй — Эзэмшсэн" : d.status === "mid" ? "Хэсэгчлэн хоцрогдолтой" : "Хоцрогдолтой"}
          </h3>
          <p className="text-body leading-display">
            {d.status === "ok"
              ? "Үндсэн мэдлэг, чадвараа эзэмшсэн байна. Доорх сул нүднүүдээ бататгаад R3–R4 түвшний даалгавраар ахиулаарай."
              : d.status === "mid"
                ? "Үндсэн ойлголттой ч зарим сэдэвт алдаа гаргаж байна. Доорх давтах сэдвүүдийг дарааллаар нь нөхөөрэй."
                : "Хэд хэдэн сэдэвт мэдлэгийн хоцрогдол байна. Доорх төлөвлөгөөний дагуу хамгийн сул сэдвээс эхлэн R1 (Суурь) түвшнээс давтаарай."}
          </p>
          <p className="text-eyebrow text-s-sub">
            ≥ {MASTERED}% — Эзэмшсэн · {PARTIAL}–{MASTERED - 1}% — Хэсэгчлэн · &lt; {PARTIAL}% — Хоцрогдолтой
          </p>
        </div>
      </BracketCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <BracketCard className="flex flex-col gap-4 bg-s-bg">
          <h3 className="font-display text-title uppercase">Хүрээгээр</h3>
          {d.byStrand.map((s) => (
            <Bar key={s.strand} label={s.strand} pct={s.pct} sub={`${s.e}/${s.m}`} />
          ))}
        </BracketCard>
        <BracketCard className="flex flex-col gap-4 bg-s-bg">
          <h3 className="font-display text-title uppercase">Мэдлэгийн төрлөөр</h3>
          {d.byKnowledge.map((k) => (
            <Bar key={k.k} label={k.k} pct={k.pct} />
          ))}
        </BracketCard>
      </div>

      {/* Мэдлэг × Блум матриц */}
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-title uppercase">Мэдлэг × Блумын матриц</h3>
        <TableWrap>
          <table className="w-full min-w-[44rem] border-collapse text-body">
            <thead>
              <tr>
                <th className="border-b border-s-border bg-s-raised px-3 py-2 text-left text-eyebrow uppercase">Мэдлэг \ Блум</th>
                {BLOOM.map((b) => (
                  <th key={b} className="border-b border-s-border bg-s-raised px-3 py-2 text-left text-eyebrow uppercase">
                    {b}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {KNOWLEDGE.map((k, ki) => (
                <tr key={k}>
                  <th scope="row" className="border-b border-s-border px-3 py-2 text-left font-display uppercase">
                    {k}
                  </th>
                  {d.matrix[ki].map((v, bi) => (
                    <td key={bi} className={cn("border-b border-s-border px-3 py-2 font-bold", v === null ? "text-s-faint" : cn(TONE[statusOf(v)].bg, TONE[statusOf(v)].text))}>
                      {v === null ? "—" : `${v}%`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </div>

      {/* Нөхөх төлөвлөгөө */}
      <BracketCard accent className="flex flex-col gap-5 bg-s-bg p-6 sm:p-8">
        <h3 className="font-display text-heading leading-headline font-bold uppercase">Хоцрогдлоо нөхөх төлөвлөгөө</h3>
        {d.weakTopics.length === 0 ? (
          <p className="text-body leading-display">
            🏆 Бүх сэдвийг эзэмшсэн байна. Даалгавартай ажиллах хэсгийн R3 (Ахисан), R4 (Гүнзгий) түвшний даалгавар болон мини даалгавраар
            мэдлэгээ гүнзгийрүүлээрэй.
          </p>
        ) : (
          <ol className="flex flex-col gap-4">
            {d.weakTopics.map((t, i) => (
              <li key={t.topic} className={cn("grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-l-4 p-4", TONE[statusOf(t.pct)].border, TONE[statusOf(t.pct)].bg)}>
                <span className="grid size-8 place-items-center bg-surface-black font-display text-label font-bold text-accent">{i + 1}</span>
                <div className="flex flex-col gap-2">
                  <p className="text-label">
                    <b className="font-display uppercase">{t.topic}</b> <span className="text-s-sub">({t.strand})</span> —{" "}
                    <span className={cn("font-bold", TONE[statusOf(t.pct)].text)}>
                      {t.pct}% · {STATUS_LABEL[statusOf(t.pct)]}
                    </span>
                  </p>
                  <p className="text-body leading-display text-s-sub">
                    {statusOf(t.pct) === "low"
                      ? "R1 (Суурь) түвшнээс эхэлж 3 даалгаврыг 4/5-аар давтал бод. Алдсан бодлогынхоо бодолтыг уншиж, «Жишээ үзэх»-ээр дахин судал."
                      : "R1-ийг хурдан давж R2 (Дунд) түвшинд бататга. Алдаа гаргасан алхмаа анхаар."}
                  </p>
                  {t.practice.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {t.practice.map((p) => (
                        <PracticeLink key={p.label} p={p} onOpenTopic={onOpenTopic} />
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
            <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 p-4">
              <span className="grid size-8 place-items-center border border-accent font-display text-label font-bold text-accent">✓</span>
              <p className="text-body leading-display">
                <b>2 долоо хоногийн дараа</b> сорилыг дахин өгч ахицаа харьцуул. Сэдэв бүрийн R1–R2 түвшинг давсны дараа оношлох сорилоор
                шалгах нь хамгийн үр дүнтэй.
              </p>
            </li>
          </ol>
        )}
      </BracketCard>

      {(d.advice.length > 0 || d.calibration.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {d.advice.map((a) => (
            <div key={a.title} className="flex flex-col gap-1 border-l-4 border-accent bg-s-raised p-4">
              <strong className="font-display text-label uppercase">{a.title}</strong>
              <p className="text-body leading-display">{a.text}</p>
            </div>
          ))}
          {d.calibration.map((c) => (
            <div key={c.strand} className="flex flex-col gap-1 border-l-4 border-warn bg-warn/10 p-4">
              <strong className="font-display text-label uppercase">Өөрийн үнэлгээ · {c.strand}</strong>
              <p className="text-body leading-display">{c.note}</p>
            </div>
          ))}
        </div>
      )}

      {/* Даалгавар бүрийн хариу */}
      <details className="border border-s-border bg-s-bg">
        <summary className="cursor-pointer px-4 py-3 font-display text-label font-bold uppercase">Даалгавар бүрийн хариу, тайлбар</summary>
        <ol className="flex flex-col divide-y divide-s-border">
          {DIAG_QUESTIONS.map((q, i) => {
            const given = attempt.answers[i];
            const ok = given === q.answer;
            return (
              <li key={i} className="flex flex-col gap-1 px-4 py-3 text-body leading-display">
                <p>
                  <span className={cn("mr-2 font-bold", ok ? "text-ok" : "text-danger")}>{ok ? "✓" : "✗"}</span>
                  {i + 1}. <MathText text={q.q} />
                </p>
                {!ok && (
                  <p className="text-s-sub">
                    Таны хариу: {given >= 0 ? <MathText text={q.choices[given]} /> : "—"} · Зөв: <MathText text={q.choices[q.answer]} />
                  </p>
                )}
                <p className="text-eyebrow text-s-sub">
                  <MathText text={q.expl} />
                </p>
              </li>
            );
          })}
        </ol>
      </details>

      <Actions>
        <Button onClick={onRetake}>Сорилыг дахин өгөх</Button>
      </Actions>
    </div>
  );
}
