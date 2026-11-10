/* Админы судалгаа — олон сурагчийн оношлох сорилын нэгдсэн үзүүлэлт (цэвэр функцүүд). */

import { BLOOM, DIAG_QUESTIONS, DIAG_STRANDS, KNOWLEDGE } from "@/data/diagnostic";
import { diagnose, type DiagAttempt, type Diagnosis, type Status } from "@/lib/diagnosis";

export type AnalyzedSub = { id: string; studentId: string; cls: string; date: string; attempt: DiagAttempt; d: Diagnosis };

const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

export function analyzeSub(s: { id: string; studentId: string; cls: string; date: string; answers: number[]; self: number[] }): AnalyzedSub {
  const attempt: DiagAttempt = { date: s.date, answers: s.answers, self: s.self };
  return { id: s.id, studentId: s.studentId, cls: s.cls, date: s.date, attempt, d: diagnose(attempt) };
}

/** Сурагч бүрийн хамгийн сүүлийн оролдлого (давхар тоолохгүйн тулд) */
export function latestPerStudent(subs: AnalyzedSub[]) {
  const map = new Map<string, AnalyzedSub>();
  subs.forEach((s) => map.set(s.studentId, s)); // created_at-аар эрэмбэлэгдсэн гэж үзнэ
  return [...map.values()];
}

export type Summary = {
  students: number;
  attempts: number;
  avgPct: number | null;
  status: Record<Status, number>;
  strands: { label: string; pct: number | null; n: number }[];
  /** Мэдлэг × Блум — нүд бүрийн дундаж (даалгаваргүй бол null) */
  matrix: (number | null)[][];
  classes: { label: string; pct: number | null; n: number }[];
  /** Сэдэв бүрийн зөв хариултын хувь — сул нь эхэндээ (n — тухайн сэдвийн асуултын тоо) */
  topics: { label: string; pct: number; n: number }[];
  /** Асуулт бүрийн зөв хариултын хувь (1..N) */
  items: { label: string; topic: string; pct: number }[];
  /** 10%-ийн алхамтай тархалт */
  histogram: { label: string; n: number }[];
  /** Өдөр бүрийн дундаж */
  byDate: { label: string; pct: number; n: number }[];
};

export function summarize(subs: AnalyzedSub[]): Summary {
  const status: Record<Status, number> = { ok: 0, mid: 0, low: 0 };
  subs.forEach((s) => status[s.d.status]++);

  const strands = DIAG_STRANDS.map((strand) => {
    const xs = subs.map((s) => s.d.byStrand.find((b) => b.strand === strand)?.pct).filter((x): x is number => x != null);
    return { label: strand, pct: avg(xs), n: xs.length };
  });

  const matrix = KNOWLEDGE.map((_, ki) =>
    BLOOM.map((_, bi) => avg(subs.map((s) => s.d.matrix[ki][bi]).filter((x): x is number => x != null))),
  );

  const byClass = new Map<string, number[]>();
  subs.forEach((s) => byClass.set(s.cls, [...(byClass.get(s.cls) ?? []), s.d.pct]));
  const classes = [...byClass.entries()]
    .map(([label, xs]) => ({ label, pct: avg(xs), n: xs.length }))
    .sort((a, b) => a.label.localeCompare(b.label, "mn"));

  // Асуулт бүрийн зөв хувь → сэдвээр нэгтгэнэ
  const correct = DIAG_QUESTIONS.map((q, i) => subs.filter((s) => s.attempt.answers[i] === q.answer).length);
  const n = subs.length;
  const items = DIAG_QUESTIONS.map((q, i) => ({ label: `${i + 1}`, topic: q.topic, pct: n ? Math.round((correct[i] / n) * 100) : 0 }));

  const byTopic = new Map<string, { e: number; m: number }>();
  DIAG_QUESTIONS.forEach((q, i) => {
    const t = byTopic.get(q.topic) ?? { e: 0, m: 0 };
    t.e += correct[i];
    t.m += n;
    byTopic.set(q.topic, t);
  });
  const topics = [...byTopic.entries()]
    .map(([label, t]) => ({ label, pct: t.m ? Math.round((t.e / t.m) * 100) : 0, n: t.m / Math.max(n, 1) }))
    .sort((a, b) => a.pct - b.pct);

  const bins = Array.from({ length: 10 }, (_, i) => ({ label: i === 9 ? "90–100" : `${i * 10}–${i * 10 + 9}`, n: 0 }));
  subs.forEach((s) => bins[Math.min(9, Math.floor(s.d.pct / 10))].n++);

  const dates = new Map<string, number[]>();
  subs.forEach((s) => dates.set(s.date, [...(dates.get(s.date) ?? []), s.d.pct]));
  const byDate = [...dates.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([label, xs]) => ({ label, pct: avg(xs)!, n: xs.length }));

  return {
    students: new Set(subs.map((s) => s.studentId)).size,
    attempts: subs.length,
    avgPct: avg(subs.map((s) => s.d.pct)),
    status,
    strands,
    matrix,
    classes,
    topics,
    items,
    histogram: bins,
    byDate,
  };
}
