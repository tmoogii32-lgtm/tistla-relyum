/* Интерактив мини даалгаврууд (сурагчдад) — бодлого үүсгэгчид.
   Бодлогын текстэд [[a/b]] нь босоо бутархай болж харагдана. */

import type { Answerable } from "@/data/interaktiv";
import { fmt, joinTerms, rawFrac, term, type Rng } from "@/lib/problems/core";

export type BarsVisual = { type: "bars"; labels: string[]; values: number[] };

export type QuizQ = {
  text: string;
  visual?: BarsVisual;
  points: number;
  explain: string;
} & ({ kind: "choice"; choices: string[]; answer: string } | { kind: "input"; answer: Answerable });

export type GameDef =
  /** shared — тоглолт бүрт ижил (бүх асуултад нийтлэг өгөгдөл үүсгэхэд) */
  | { kind: "quiz"; count: number; timeLimit?: number; make: (i: number, r: Rng, shared: Rng) => QuizQ }
  | { kind: "match"; pairs: number; pointsPerPair: number; penalty: number; make: (r: Rng) => [string, string][] }
  | { kind: "grid"; rounds: number; pointsPerRound: number; size: number; make: (i: number, r: Rng) => GridRound };

export type GridRound = { text: string; target: [number, number]; explain: string; marks?: { label: string; at: [number, number] }[] };

const nz = (r: Rng, a: number, b: number) => {
  let v = 0;
  while (v === 0) v = r.int(a, b);
  return v;
};

/** Сонголтууд: зөв + давхардалгүй буруу, холилдсон */
function choices(r: Rng, right: string, wrong: string[]) {
  const ws = [...new Set(wrong.filter((w) => w && w !== right))].slice(0, 3);
  return r.shuffle([right, ...ws]);
}
const signed = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n));

/* ---------- 1. Хурдан тооцоолол ---------- */
const speed: GameDef = {
  kind: "quiz",
  count: 10,
  timeLimit: 90,
  make: (_i, r) => {
    const op = r.pick(["+", "−", "·", ":"] as const);
    let a = r.int(-20, 20);
    const b = nz(r, -12, 12);
    let ans: number;
    if (op === "+") ans = a + b;
    else if (op === "−") ans = a - b;
    else if (op === "·") {
      a = r.int(-12, 12);
      ans = a * b;
    } else {
      ans = r.int(-12, 12);
      a = ans * b;
    }
    return {
      kind: "input",
      text: `${fmt(a)} ${op} ${signed(b)} = ?`,
      answer: { type: "num", answer: ans },
      points: 10,
      explain: `${fmt(a)} ${op} ${signed(b)} = ${fmt(ans)}`,
    };
  },
};

/* ---------- 2. Бутархайн хос ---------- */
const FRACTION_FACTS: [number, number][] = [
  [1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [1, 20], [3, 20], [1, 8], [3, 8], [1, 25],
];
const fracMatch: GameDef = {
  kind: "match",
  pairs: 6,
  pointsPerPair: 20,
  penalty: 5,
  make: (r) =>
    r.shuffle(FRACTION_FACTS).slice(0, 6).map(([n, d]) => {
      const v = n / d;
      const partner = r.next() < 0.5 ? fmt(v) : `${fmt(v * 100)}%`;
      return [rawFrac(n, d), partner];
    }),
};

/* ---------- 3. Хямдралын дэлгүүр ---------- */
const shop: GameDef = {
  kind: "quiz",
  count: 5,
  make: (i, r) => {
    const price = r.int(4, 40) * 1000;
    const p = r.pick([10, 15, 20, 25, 30, 40, 50]);
    const tg = (v: number) => `${fmt(v)}₮`;
    if (i === 0) {
      const v = (price * p) / 100;
      return { kind: "choice", text: `${tg(price)}-ийн цүнх ${p}% хямдарчээ. Хэдэн төгрөгөөр хямдарсан бэ?`, choices: choices(r, tg(v), [tg(price - v), tg(p * 100), tg(v * 2)]), answer: tg(v), points: 20, explain: `${tg(price)} · ${p}/100 = ${tg(v)}` };
    }
    if (i === 1) {
      const v = price - (price * p) / 100;
      return { kind: "choice", text: `${tg(price)}-ийн гутал ${p}% хямдарвал шинэ үнэ хэд вэ?`, choices: choices(r, tg(v), [tg((price * p) / 100), tg(price - p), tg(price + (price * p) / 100)]), answer: tg(v), points: 20, explain: `${tg(price)} − ${tg((price * p) / 100)} = ${tg(v)}` };
    }
    if (i === 2) {
      const v = price + (price * p) / 100;
      return { kind: "choice", text: `Дэлгүүр ${tg(price)}-ийн барааны үнийг ${p}%-иар нэмэв. Шинэ үнэ?`, choices: choices(r, tg(v), [tg(price - (price * p) / 100), tg(price + p), tg((price * p) / 100)]), answer: tg(v), points: 20, explain: `${tg(price)} + ${tg((price * p) / 100)} = ${tg(v)}` };
    }
    if (i === 3) {
      const a = r.int(4, 9) * 1000;
      const pa = r.pick([20, 25, 30]);
      const b = a + r.pick([1000, 2000]);
      let pb = pa + r.pick([10, 20]);
      const fa = a - (a * pa) / 100;
      if (b - (b * pb) / 100 === fa) pb += 5; // тэнцүү гарвал ялгаа үүсгэнэ
      const fb = b - (b * pb) / 100;
      const right = fa < fb ? "А дэлгүүр" : fa > fb ? "Б дэлгүүр" : "Адилхан";
      return {
        kind: "choice",
        text: `Ижил ном: А дэлгүүрт ${tg(a)}, ${pa}% хямдралтай. Б дэлгүүрт ${tg(b)}, ${pb}% хямдралтай. Аль нь хямд вэ?`,
        choices: ["А дэлгүүр", "Б дэлгүүр", "Адилхан"],
        answer: right,
        points: 20,
        explain: `А: ${tg(fa)}, Б: ${tg(fb)} → ${right}`,
      };
    }
    const sale = price - (price * p) / 100;
    return {
      kind: "choice",
      text: `${p}% хямдралын дараа барааны үнэ ${tg(sale)} болжээ. Анхны үнэ хэд байсан бэ?`,
      choices: choices(r, tg(price), [tg(sale + (sale * p) / 100), tg(sale + p * 100), tg(sale * 2)]),
      answer: tg(price),
      points: 20,
      explain: `${tg(sale)} нь анхны үнийн ${100 - p}%. ${tg(sale)} : ${fmt((100 - p) / 100)} = ${tg(price)}`,
    };
  },
};

/* ---------- 4. Зөв үү, буруу юу? ---------- */
const trueFalse: GameDef = {
  kind: "quiz",
  count: 10,
  make: (_i, r) => {
    const truth = r.next() < 0.5;
    const kind = r.int(0, 3);
    let text = "";
    let explain = "";
    if (kind === 0) {
      const a = r.int(2, 7);
      const b = nz(r, -6, 6);
      const right = joinTerms([term(a), fmt(a * b)]);
      const shown = truth ? right : joinTerms([term(a), fmt(b)]);
      text = `${a}(x ${b > 0 ? "+" : "−"} ${Math.abs(b)}) = ${shown}`;
      explain = `${a}(x ${b > 0 ? "+" : "−"} ${Math.abs(b)}) = ${right}`;
    } else if (kind === 1) {
      const a = r.int(2, 9);
      const b = r.int(2, 9);
      const s = a + b;
      text = `${a}x + ${b}x = ${truth ? term(s) : `${s}x²`}`;
      explain = `Төсөөтэй гишүүд: ${a}x + ${b}x = ${term(s)}`;
    } else if (kind === 2) {
      const x = nz(r, -5, 5);
      const a = r.int(2, 6);
      const b = r.int(-9, 9);
      const v = a * x + b;
      text = `x = ${fmt(x)} үед ${joinTerms([term(a), b ? fmt(b) : ""])} = ${fmt(truth ? v : v + r.pick([-2, -1, 1, 2]))}`;
      explain = `${a} · ${signed(x)} ${b >= 0 ? "+" : "−"} ${Math.abs(b)} = ${fmt(v)}`;
    } else {
      const x = nz(r, -6, 6);
      text = `(${fmt(x)})² = ${fmt(truth ? x * x : -(x * x))}`;
      explain = `Тооны квадрат сөрөг байдаггүй: (${fmt(x)})² = ${fmt(x * x)}`;
    }
    const answer = truth ? "Зөв" : "Буруу";
    return { kind: "choice", text, choices: ["Зөв", "Буруу"], answer, points: 10, explain: `${answer}. ${explain}` };
  },
};

/* ---------- 5. Тэгшитгэлийн шат ---------- */
const ladder: GameDef = {
  kind: "quiz",
  count: 5,
  make: (i, r) => {
    const x = nz(r, -9, 12);
    const pts = [10, 15, 20, 25, 30][i];
    const q = (text: string, explain: string): QuizQ => ({ kind: "input", text: `${i + 1}-р шат: ${text}. x = ?`, answer: { type: "num", answer: x }, points: pts, explain });
    if (i === 0) {
      const a = r.int(2, 15);
      return q(`x + ${a} = ${fmt(x + a)}`, `x = ${fmt(x + a)} − ${a} = ${fmt(x)}`);
    }
    if (i === 1) {
      const a = nz(r, -6, 9);
      return q(`${term(a)} = ${fmt(a * x)}`, `x = ${fmt(a * x)} : ${signed(a)} = ${fmt(x)}`);
    }
    if (i === 2) {
      const a = r.int(2, 7);
      const b = nz(r, -10, 10);
      return q(`${joinTerms([term(a), fmt(b)])} = ${fmt(a * x + b)}`, `${term(a)} = ${fmt(a * x)} → x = ${fmt(x)}`);
    }
    if (i === 3) {
      const a = r.int(4, 9);
      const c = r.int(1, a - 1);
      const b = r.int(-9, 9);
      const d = (a - c) * x + b;
      return q(`${joinTerms([term(a), b ? fmt(b) : ""])} = ${joinTerms([term(c), d ? fmt(d) : ""])}`, `${term(a - c)} = ${fmt(d - b)} → x = ${fmt(x)}`);
    }
    const a = r.int(2, 6);
    const b = nz(r, -6, 6);
    return q(`${a}(x ${b > 0 ? "+" : "−"} ${Math.abs(b)}) = ${fmt(a * (x + b))}`, `x ${b > 0 ? "+" : "−"} ${Math.abs(b)} = ${fmt(x + b)} → x = ${fmt(x)}`);
  },
};

/* ---------- 6. Дарааллын нууц ---------- */
const sequenceSecret: GameDef = {
  kind: "quiz",
  count: 5,
  make: (i, r) => {
    let s: number[];
    let rule: string;
    if (i === 0) {
      const a = r.int(1, 20);
      const d = r.int(2, 9);
      s = [0, 1, 2, 3, 4].map((k) => a + k * d);
      rule = `Гишүүн бүр ${d}-ээр нэмэгдэнэ.`;
    } else if (i === 1) {
      const a = r.int(30, 80);
      const d = r.int(3, 8);
      s = [0, 1, 2, 3, 4].map((k) => a - k * d);
      rule = `Гишүүн бүр ${d}-ээр хорогдоно.`;
    } else if (i === 2) {
      const a = r.int(1, 4);
      const q = r.pick([2, 3]);
      s = [0, 1, 2, 3, 4].map((k) => a * q ** k);
      rule = `Гишүүн бүр ${q} дахин өснө.`;
    } else if (i === 3) {
      const c = r.int(-3, 5);
      s = [1, 2, 3, 4, 5].map((n) => n * n + c);
      rule = `n² ${c >= 0 ? "+" : "−"} ${Math.abs(c)}: квадрат тоонуудад ${fmt(c)} нэмсэн.`;
    } else {
      const a = r.int(1, 5);
      const b = r.int(a, a + 5);
      s = [a, b];
      while (s.length < 5) s.push(s[s.length - 1] + s[s.length - 2]);
      rule = "Гишүүн бүр өмнөх хоёр гишүүний нийлбэр.";
    }
    return {
      kind: "input",
      text: `${s.slice(0, 4).map(fmt).join(",  ")},  ?`,
      answer: { type: "num", answer: s[4] },
      points: 20,
      explain: `${rule} Дараагийнх нь ${fmt(s[4])}.`,
    };
  },
};

/* ---------- 7. Координатын эрдэнэс ---------- */
const coordinates: GameDef = {
  kind: "grid",
  rounds: 5,
  pointsPerRound: 20,
  size: 5,
  make: (i, r) => {
    const x = nz(r, -5, 5);
    const y = nz(r, -5, 5);
    if (i < 3) return { text: `Эрдэнэс ${pt(x, y)} цэгт нуугдсан. Тэр цэг дээр дар.`, target: [x, y], explain: `x = ${fmt(x)} (${x > 0 ? "баруун" : "зүүн"}), y = ${fmt(y)} (${y > 0 ? "дээш" : "доош"}).` };
    if (i === 3) return { text: `A${pt(x, y)} цэгийг Oy тэнхлэгийн хувьд тэгш хэмтэй буулгасан цэг дээр дар.`, target: [-x, y], marks: [{ label: "A", at: [x, y] }], explain: `Oy-ийн хувьд x-ийн тэмдэг солигдоно: ${pt(-x, y)}.` };
    const dx = r.int(-3, 3);
    const dy = r.int(-3, 3);
    const tx = Math.max(-5, Math.min(5, x + dx));
    const ty = Math.max(-5, Math.min(5, y + dy));
    return { text: `B${pt(x, y)} цэгээс ${tx - x >= 0 ? `баруун тийш ${tx - x}` : `зүүн тийш ${x - tx}`}, ${ty - y >= 0 ? `дээш ${ty - y}` : `доош ${y - ty}`} нүд шилжсэн цэг дээр дар.`, target: [tx, ty], marks: [{ label: "B", at: [x, y] }], explain: `${pt(x, y)} → ${pt(tx, ty)}` };
  },
};
function pt(x: number, y: number) {
  return `(${fmt(x)}; ${fmt(y)})`;
}

/* ---------- 8. Өнцгийн таавар ---------- */
const angles: GameDef = {
  kind: "quiz",
  count: 5,
  make: (i, r) => {
    const deg = (v: number) => `${v}°`;
    const mk = (text: string, ans: number, wrong: number[], explain: string): QuizQ => ({ kind: "choice", text, choices: choices(r, deg(ans), wrong.map(deg)), answer: deg(ans), points: 20, explain });
    if (i === 0) {
      const a = r.int(5, 14) * 5;
      const b = r.int(5, 14) * 5;
      const c = 180 - a - b;
      return mk(`Гурвалжны хоёр өнцөг ${a}° ба ${b}°. Гурав дахь өнцөг?`, c, [a + b, 360 - a - b, 90 - c > 0 ? 90 : c + 10], `180° − ${a}° − ${b}° = ${c}°`);
    }
    if (i === 1) {
      const a = r.int(20, 160);
      return mk(`Зэргэлдээ хоёр өнцгийн нэг нь ${a}°. Нөгөө нь?`, 180 - a, [a, 360 - a, 90 - a > 0 ? 90 - a : a - 90], `Зэргэлдээ өнцгүүдийн нийлбэр 180°: 180° − ${a}° = ${180 - a}°`);
    }
    if (i === 2) {
      const a = r.int(20, 160);
      return mk(`Хоёр шулуун огтлолцоход нэг өнцөг ${a}° болов. Түүний босоо өнцөг хэд вэ?`, a, [180 - a, 360 - a, a / 2 === Math.round(a / 2) ? a / 2 : a + 10], `Босоо өнцгүүд тэнцүү: ${a}°`);
    }
    if (i === 3) {
      const top = r.int(10, 40) * 2;
      const base = (180 - top) / 2;
      return mk(`Адил хажуут гурвалжны оройн өнцөг ${top}°. Суурийн нэг өнцөг?`, base, [180 - top, top, base + 10], `(180° − ${top}°) : 2 = ${base}°`);
    }
    const a = r.int(6, 14) * 5;
    const b = r.int(6, 14) * 5;
    return mk(`Гурвалжны хоёр өнцөг ${a}° ба ${b}°. Гурав дахь оройн гадаад өнцөг хэд вэ?`, a + b, [180 - a - b, 180 - a, 360 - a - b], `Гадаад өнцөг нь зэргэлдээ бус хоёр дотоод өнцгийн нийлбэр: ${a}° + ${b}° = ${a + b}°`);
  },
};

/* ---------- 9. Статистикийн мөрдөгч ---------- */
const detective: GameDef = {
  kind: "quiz",
  count: 4,
  make: (i, _r, shared) => {
    // 4 асуулт бүгд нэг өгөгдөл дээр — shared нь тоглолт бүрт ижил дарааллаар эхэлнэ
    const data = detectiveData(shared);
    const labels = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
    const visual: BarsVisual = { type: "bars", labels, values: data.values };
    const intro = "Нэг долоо хоногт номын санд ирсэн сурагчдын тоо. ";
    const qs: [string, number, string][] = [
      ["Арифметик дундаж хэд вэ?", data.mean, `Нийлбэр ${data.sum} : 7 = ${data.mean}`],
      ["Медиан хэд вэ?", data.median, `Эрэмбэлбэл: ${[...data.values].sort((a, b) => a - b).join(", ")}. Голын утга ${data.median}`],
      ["Моод хэд вэ?", data.mode, `Хамгийн олон давтагдсан утга: ${data.mode}`],
      ["Далайц хэд вэ?", data.range, `${Math.max(...data.values)} − ${Math.min(...data.values)} = ${data.range}`],
    ];
    const [q, ans, explain] = qs[i];
    return { kind: "input", text: intro + q, visual, answer: { type: "num", answer: ans }, points: 25, explain };
  },
};

/** 7 өдрийн өгөгдөл: бүхэл дундаж, ганц моод */
function detectiveData(r: Rng) {
  for (;;) {
    const mode = r.int(8, 20);
    const values = [mode, mode, ...Array.from({ length: 5 }, () => r.int(4, 28))];
    const counts = new Map<number, number>();
    values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
    const maxC = Math.max(...counts.values());
    const modes = [...counts].filter(([, c]) => c === maxC);
    const sum = values.reduce((a, b) => a + b, 0);
    if (modes.length !== 1 || modes[0][0] !== mode || sum % 7 !== 0) continue;
    const sorted = [...values].sort((a, b) => a - b);
    return { values: r.shuffle(values), sum, mean: sum / 7, median: sorted[3], mode, range: sorted[6] - sorted[0] };
  }
}

export const GAMES: Record<string, GameDef> = {
  speed,
  "frac-match": fracMatch,
  shop,
  "true-false": trueFalse,
  ladder,
  sequence: sequenceSecret,
  coordinates,
  angles,
  detective,
};
