/* Түвшинчилсэн даалгавар: сэдвийн бүртгэл, даалгаврын бодлого үүсгэх, сонголт бэлтгэх */

import { STRANDS } from "@/data/math";
import type { Answerable } from "@/data/interaktiv";
import { ALGEBRA_GENERATORS } from "./algebra";
import { display, fmt, rng, type Generator, type Level, type Problem, type Rng } from "./core";
import { GEOMETRY_GENERATORS } from "./geometry";
import { NUMBER_GENERATORS } from "./number";
import { STATISTICS_GENERATORS } from "./statistics";

export type { Level, Problem } from "./core";
export { display } from "./core";

/** Түвшин бүрт 3 даалгавар, даалгавар бүрт 5 бодлого, 4 зөв бол тэнцэнэ */
export const TASKS_PER_LEVEL = 3;
export const PROBLEMS_PER_TASK = 5;
export const TASK_PASS = 4;
export const LEVEL_KEYS = ["Т1", "Т2", "Т3", "Т4"] as const;

/** 1, 2-р даалгавар сонголттой, 3-р даалгавар хариугаа бичих */
export const TASK_MODES = ["choice", "choice", "input"] as const;
export type TaskMode = (typeof TASK_MODES)[number];

const BY_STRAND: Record<string, Generator[]> = {
  number: NUMBER_GENERATORS,
  algebra: ALGEBRA_GENERATORS,
  geometry: GEOMETRY_GENERATORS,
  statistics: STATISTICS_GENERATORS,
};

export type Topic = { id: string; title: string; strandId: string; strandTitle: string; index: string; gen: Generator };
export type StrandNode = { id: string; title: string; index: number; topics: Topic[] };

/** Хүрээ → сэдвийн мод (data/math.ts-ийн сурах бичгийн бүлгүүдээс) */
export const TOPIC_TREE: StrandNode[] = STRANDS.map((s, si) => ({
  id: s.id,
  title: s.title,
  index: si + 1,
  topics: s.chapters.map((title, ci) => ({
    id: `${s.id}-${ci + 1}`,
    title,
    strandId: s.id,
    strandTitle: s.title,
    index: `${si + 1}.${ci + 1}`,
    gen: BY_STRAND[s.id][ci],
  })),
}));

export const TOPICS: Topic[] = TOPIC_TREE.flatMap((s) => s.topics);
export const topicById = (id: string) => TOPICS.find((t) => t.id === id) ?? TOPICS[0];

/** Нэг оролдлогын 5 бодлого — seed-ээс тодорхой гарна, давтагдахгүй */
export function makeAttempt(topic: Topic, level: Level, seed: string): Problem[] {
  const out: Problem[] = [];
  for (let i = 0; out.length < PROBLEMS_PER_TASK && i < 40; i++) {
    const p = topic.gen(level, rng(`${seed}|${i}`));
    if (!out.some((q) => q.text === p.text)) out.push(p);
  }
  return out;
}

/** "Жишээ үзэх" — бодолттой жишээ бодлого */
export function makeExample(topic: Topic, level: Level, seed: string): Problem {
  return topic.gen(level, rng(`${seed}|example`));
}

/** Сонголт: зөв хариу + 3 буруу (давхардалгүй), холилдсон */
export function makeChoices(p: Problem, seed: string): string[] {
  const right = display(p.ans);
  const wrong: string[] = [];
  for (const w of p.wrong) if (w && w !== right && !wrong.includes(w)) wrong.push(w);
  // Тоон хариунд дутвал ойролцоо тоогоор нөхнө
  if (p.ans.type === "num") {
    const a = p.ans.answer;
    const unit = p.ans.unit ? ` ${p.ans.unit}` : "";
    for (const d of [1, -1, 2, 10, -2, 5]) {
      if (wrong.length >= 3) break;
      const s = fmt(a + d) + unit;
      if (s !== right && !wrong.includes(s)) wrong.push(s);
    }
  }
  const r: Rng = rng(`${seed}|choices`);
  return r.shuffle([right, ...wrong.slice(0, 3)]);
}

/** Бичсэн хариуг шалгах хэлбэрт (lib/judge) — pick бол сонголтоор л */
export function toAnswerable(p: Problem): Answerable | null {
  if (p.ans.type === "num") return { type: "num", answer: p.ans.answer, unit: p.ans.unit };
  if (p.ans.type === "frac") return { type: "frac", answer: p.ans.answer };
  return null;
}
