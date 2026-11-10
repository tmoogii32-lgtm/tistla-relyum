/* Бодлого үүсгэх суурь: seed-тэй санамсаргүй тоо, бодлогын төрөл, туслах функцүүд.
   Seed-тэй тул ижил (сурагч, сэдэв, түвшин, даалгавар, оролдлого)-д ижил бодлого гарна —
   server/client дээр зөрөхгүй, дахин оролдоход шинэ бодлого гарна. */

/** num: тоон хариу, frac: энгийн бутархай [хүртвэр, хуваарь], pick: зөвхөн сонголтоор (текст хариу) */
export type Answer =
  | { type: "num"; answer: number; unit?: string }
  | { type: "frac"; answer: [number, number] }
  | { type: "pick"; answer: string };

export type Problem = {
  /** Бодлогын текст. [[a/b]] нь босоо бутархай болж харагдана */
  text: string;
  ans: Answer;
  /** Буруу хариултын хувилбарууд (түгээмэл алдаанаас) — харагдах хэлбэрээр */
  wrong: string[];
  /** Бодолтын алхмууд */
  steps: string[];
};

export type Level = 0 | 1 | 2 | 3;
export type Generator = (level: Level, r: Rng) => Problem;

/* ---------- Санамсаргүй тоо ---------- */
export type Rng = {
  next: () => number;
  int: (a: number, b: number) => number;
  pick: <T>(arr: readonly T[]) => T;
  shuffle: <T>(arr: readonly T[]) => T[];
  sign: () => 1 | -1;
};

function hashSeed(s: string) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

/** mulberry32 */
export function rng(seed: string): Rng {
  let a = hashSeed(seed)();
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  return {
    next,
    int,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => {
      const out = [...arr];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    sign: () => (next() < 0.5 ? 1 : -1),
  };
}

/* ---------- Тоо ---------- */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

export function reduce(n: number, d: number): [number, number] {
  const g = gcd(n, d);
  const s = d < 0 ? -1 : 1;
  return [(s * n) / g, (s * d) / g];
}

/** Хөвөгч цэгийн алдааг арилгана */
export const round = (x: number, digits = 6) => Math.round(x * 10 ** digits) / 10 ** digits;

/** Монгол бичлэг: аравтын таслал, урт хасах тэмдэг */
export function fmt(x: number) {
  return String(round(x)).replace(".", ",").replace("-", "−");
}

/** Бутархайг [[a/b]] тэмдэглэгээгээр (сөрөг бол өмнө нь −) */
export function frac(n: number, d: number) {
  const [a, b] = reduce(n, d);
  if (b === 1) return fmt(a);
  return `${a < 0 ? "−" : ""}[[${Math.abs(a)}/${b}]]`;
}

/** Хураахгүйгээр */
export const rawFrac = (n: number, d: number) => `${n < 0 ? "−" : ""}[[${Math.abs(n)}/${d}]]`;

/** Хариуг харагдах хэлбэрт */
export function display(ans: Answer) {
  if (ans.type === "num") return fmt(ans.answer) + (ans.unit ? ` ${ans.unit}` : "");
  if (ans.type === "frac") return frac(ans.answer[0], ans.answer[1]);
  return ans.answer;
}

export const num = (answer: number, unit?: string): Answer => ({ type: "num", answer: round(answer), unit });
export const fr = (n: number, d: number): Answer => ({ type: "frac", answer: reduce(n, d) });
export const pick = (answer: string): Answer => ({ type: "pick", answer });

/** Тоон хариуны буруу хувилбарыг нэгжтэй нь */
export const wn = (values: number[], unit?: string) => values.map((v) => fmt(round(v)) + (unit ? ` ${unit}` : ""));

/** Цэгийн координат */
export const pt = (x: number, y: number) => `(${fmt(x)}; ${fmt(y)})`;

/** y = kx + b хэлбэрээр */
export function lineEq(k: number, b: number) {
  const kx = k === 0 ? "" : k === 1 ? "x" : k === -1 ? "−x" : `${fmt(k)}x`;
  if (!kx) return `y = ${fmt(b)}`;
  if (b === 0) return `y = ${kx}`;
  return `y = ${kx} ${b > 0 ? "+" : "−"} ${fmt(Math.abs(b))}`;
}

/** ax + b хэлбэрийн нэр томьёо (x-ийн коэффициент) */
export function term(coef: number, v = "x") {
  if (coef === 1) return v;
  if (coef === -1) return `−${v}`;
  return `${fmt(coef)}${v}`;
}

/** Нэр томьёонуудыг "+ −"-тэй зөв нийлүүлнэ */
export function joinTerms(parts: string[]) {
  return parts
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p : p.startsWith("−") ? `− ${p.slice(1)}` : `+ ${p}`))
    .join(" ");
}
