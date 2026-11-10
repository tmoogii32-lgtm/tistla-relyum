/* Оношлох сорилын дүн → онош, хоцрогдолтой сэдэв, нөхөх төлөвлөгөө
   (google-form/shalgalt-form.gs-ийн diagnose() логик) */

import {
  BLOOM,
  BLOOM_ADVICE,
  DIAG_QUESTIONS,
  DIAG_STRANDS,
  KNOWLEDGE,
  KNOWLEDGE_ADVICE,
  MASTERED,
  PARTIAL,
  PRACTICE_BY_TOPIC,
  SELF_ASSESS,
  type Bloom,
  type DiagStrand,
  type Knowledge,
  type Practice,
} from "@/data/diagnostic";

/** Хадгалах өгөгдөл: хариунууд (сонголтын индекс, -1 = хариулаагүй), өөрийн үнэлгээ (1–4) */
export type DiagAttempt = { date: string; answers: number[]; self: number[] };
/** studentId ("guest") → оролдлогууд (сүүлийнх нь хамгийн сүүлд) */
export type DiagStore = Record<string, DiagAttempt[]>;
export const EMPTY_DIAG: DiagStore = {};
export const isDiagStore = (v: unknown): v is DiagStore => typeof v === "object" && v !== null && !Array.isArray(v);

export type Status = "ok" | "mid" | "low";
export const STATUS_LABEL: Record<Status, string> = { ok: "Эзэмшсэн", mid: "Хэсэгчлэн", low: "Хоцрогдолтой" };

export const statusOf = (pct: number): Status => (pct >= MASTERED ? "ok" : pct >= PARTIAL ? "mid" : "low");
type Tally = { e: number; m: number };
const pctOf = (t: Tally) => (t.m ? Math.round((t.e / t.m) * 100) : 0);

export type Diagnosis = {
  earned: number;
  possible: number;
  pct: number;
  status: Status;
  byStrand: { strand: DiagStrand; pct: number; status: Status; e: number; m: number }[];
  byKnowledge: { k: Knowledge; pct: number; status: Status }[];
  byBloom: { b: Bloom; pct: number; status: Status }[];
  /** 4 × 6 матриц — даалгаваргүй нүд null */
  matrix: (number | null)[][];
  /** Давтах сэдвүүд (< 80%), хамгийн сул нь эхэндээ */
  weakTopics: { topic: string; strand: DiagStrand; pct: number; practice: Practice[] }[];
  /** Өөрийн үнэлгээ ба гүйцэтгэлийн зөрүү */
  calibration: { strand: DiagStrand; note: string }[];
  /** Мэдлэгийн төрөл / Блумын түвшний зөвлөгөө (зөвхөн сул хэсэгт) */
  advice: { title: string; text: string }[];
};

export function diagnose(a: DiagAttempt): Diagnosis {
  const byK = new Map<string, Tally>();
  const byB = new Map<string, Tally>();
  const byS = new Map<string, Tally>();
  const byT = new Map<string, Tally & { strand: DiagStrand }>();
  const byCell = new Map<string, Tally>();
  const add = (m: Map<string, Tally>, key: string, ok: boolean) => {
    const t = m.get(key) ?? { e: 0, m: 0 };
    t.e += ok ? 1 : 0;
    t.m += 1;
    m.set(key, t);
  };

  let earned = 0;
  DIAG_QUESTIONS.forEach((q, i) => {
    const ok = a.answers[i] === q.answer;
    if (ok) earned++;
    add(byK, q.k, ok);
    add(byB, q.b, ok);
    add(byS, q.strand, ok);
    add(byCell, `${q.k}|${q.b}`, ok);
    const t = byT.get(q.topic) ?? { e: 0, m: 0, strand: q.strand };
    t.e += ok ? 1 : 0;
    t.m += 1;
    byT.set(q.topic, t);
  });
  const possible = DIAG_QUESTIONS.length;
  const pct = Math.round((earned / possible) * 100);

  const byStrand = DIAG_STRANDS.filter((s) => byS.has(s)).map((s) => {
    const t = byS.get(s)!;
    return { strand: s, pct: pctOf(t), status: statusOf(pctOf(t)), e: t.e, m: t.m };
  });
  const byKnowledge = KNOWLEDGE.filter((k) => byK.has(k)).map((k) => ({ k, pct: pctOf(byK.get(k)!), status: statusOf(pctOf(byK.get(k)!)) }));
  const byBloom = BLOOM.filter((b) => byB.has(b)).map((b) => ({ b, pct: pctOf(byB.get(b)!), status: statusOf(pctOf(byB.get(b)!)) }));
  const matrix = KNOWLEDGE.map((k) => BLOOM.map((b) => (byCell.has(`${k}|${b}`) ? pctOf(byCell.get(`${k}|${b}`)!) : null)));

  const weakTopics = [...byT.entries()]
    .map(([topic, t]) => ({ topic, strand: t.strand, pct: pctOf(t), practice: PRACTICE_BY_TOPIC[topic] ?? [] }))
    .filter((t) => t.pct < MASTERED)
    .sort((x, y) => x.pct - y.pct || DIAG_STRANDS.indexOf(x.strand) - DIAG_STRANDS.indexOf(y.strand));

  const calibration: Diagnosis["calibration"] = [];
  SELF_ASSESS.forEach((s, i) => {
    const self = a.self[i];
    const perf = byStrand.find((x) => x.strand === s.strand);
    if (!self || !perf) return;
    const selfPct = self * 25;
    if (selfPct >= 75 && perf.pct < PARTIAL)
      calibration.push({ strand: s.strand, note: `Өөрийгөө хэт өндөр үнэлсэн (итгэл ${self}/4, гүйцэтгэл ${perf.pct}%). Бодлогоо шалгах дадлага хэрэгтэй.` });
    if (selfPct <= 50 && perf.pct >= MASTERED)
      calibration.push({ strand: s.strand, note: `Өөртөө итгэл дутуу (итгэл ${self}/4, гүйцэтгэл ${perf.pct}%). Чи үүнийг сайн мэдэж байна!` });
  });

  const advice: Diagnosis["advice"] = [
    ...byKnowledge.filter((x) => x.status !== "ok").map((x) => ({ title: `${x.k} мэдлэг · ${x.pct}%`, text: KNOWLEDGE_ADVICE[x.k] })),
    ...byBloom
      .filter((x) => x.status === "low" && BLOOM_ADVICE[x.b])
      .map((x) => ({ title: `Блум: ${x.b} · ${x.pct}%`, text: BLOOM_ADVICE[x.b]! })),
  ];

  return { earned, possible, pct, status: statusOf(pct), byStrand, byKnowledge, byBloom, matrix, weakTopics, calibration, advice };
}

/** Хоцрогдлын бүртгэлд оруулах дүн: хүрээ бүрийг 5 онооны хуваарьт (80% = 4 = тэнцэх босго) */
export function strandScores(d: Diagnosis) {
  return d.byStrand.map((s) => ({ strand: s.strand, score: Math.floor(s.pct / 20) }));
}
