/* Хүрээ 1 — Тоо тоолол (7 сэдэв). Түвшин: 0 Суурь, 1 Дунд, 2 Ахисан, 3 Гүнзгий */

import { fmt, fr, frac, gcd, lcm, num, pick, rawFrac, reduce, round, wn, type Generator, type Rng } from "./core";

/** Хураагдсан p/q (q ∈ qs) */
function properFrac(r: Rng, qs: number[]): [number, number] {
  for (;;) {
    const q = r.pick(qs);
    const p = r.int(1, q - 1);
    if (gcd(p, q) === 1) return [p, q];
  }
}

/* 1. Тоог жиших, тоймлох */
const compareRound: Generator = (level, r) => {
  if (level === 0) {
    const x = r.int(101, 999) / 100;
    const ans = Math.round(x * 10) / 10;
    return {
      text: `${fmt(x)}-ийг 0,1-ийн нарийвчлалтай тоймло.`,
      ans: num(ans),
      wrong: wn([Math.floor(x * 10) / 10 === ans ? ans + 0.1 : Math.floor(x * 10) / 10, Math.round(x), round(ans - 0.1)]),
      steps: [`Аравны орны дараах цифр (зууны орон) нь ${Math.round(x * 100) % 10}.`, `${Math.round(x * 100) % 10 >= 5 ? "5 ба түүнээс их тул аравны оронг 1-ээр нэмнэ" : "5-аас бага тул аравны орон хэвээр"}: ${fmt(ans)}.`],
    };
  }
  if (level === 1) {
    const x = r.int(1001, 9999) / 1000;
    const ans = Math.round(x * 100) / 100;
    const third = Math.round(x * 1000) % 10;
    return {
      text: `${fmt(x)}-ийг 0,01-ийн нарийвчлалтай тоймло.`,
      ans: num(ans),
      wrong: wn([third >= 5 ? Math.floor(x * 100) / 100 : round(ans + 0.01), Math.round(x * 10) / 10, round(ans - 0.01)]),
      steps: [`Мянганы орны цифр нь ${third}.`, `${third >= 5 ? "5 ба түүнээс их тул зууны оронг 1-ээр нэмнэ" : "5-аас бага тул зууны орон хэвээр"}: ${fmt(ans)}.`],
    };
  }
  // 2: хамгийн их, 3: хамгийн бага (сөрөг тоо)
  const FR: [number, number][] = [[1, 2], [3, 4], [2, 5], [3, 8], [5, 8], [7, 10], [4, 5], [1, 4]];
  const [p, q] = r.pick(FR);
  const s = level === 3 ? -1 : 1;
  const values = new Map<number, string>([[s * (p / q), (s < 0 ? "−" : "") + rawFrac(p, q)]]);
  while (values.size < 4) {
    const v = s * (r.int(level === 3 ? 5 : 10, level === 3 ? 30 : 95) / (level === 3 ? 10 : 100));
    if (!values.has(v)) values.set(v, fmt(v));
  }
  const entries = [...values.entries()];
  const best = entries.reduce((a, b) => (level === 3 ? (b[0] < a[0] ? b : a) : b[0] > a[0] ? b : a));
  return {
    text: `Аль нь хамгийн ${level === 3 ? "бага" : "их"} вэ? ${r.shuffle(entries.map((e) => e[1])).join(";  ")}`,
    ans: pick(best[1]),
    wrong: entries.filter((e) => e !== best).map((e) => e[1]),
    steps: [
      `Бутархайг аравтын бутархай болго: ${rawFrac(p, q)} = ${fmt(p / q)}.`,
      level === 3 ? "Сөрөг тоонуудаас модуль нь их нь хамгийн бага." : "Аравны, зууны оронгоор нь жишнэ.",
      `Хариу: ${best[1]}`,
    ],
  };
};

/* 2. Энгийн бутархайг хураах, жиших */
const simplifyCompare: Generator = (level, r) => {
  if (level <= 1) {
    const [p, q] = properFrac(r, [2, 3, 4, 5, 6, 7, 8, 9]);
    const k = level === 0 ? r.int(2, 5) : r.int(6, 12);
    const n = p * k;
    const d = q * k;
    return {
      text: `${rawFrac(n, d)}-ийг хураа.`,
      ans: fr(n, d),
      wrong: [rawFrac(p, d), rawFrac(n, q), rawFrac(p + 1, q + 1)].filter((w) => w !== rawFrac(p, q)),
      steps: [`ХИЕХ(${n}, ${d}) = ${k}.`, `Хүртвэр ба хуваарийг ${k}-д хуваана: ${rawFrac(n, d)} = ${rawFrac(p, q)}.`],
    };
  }
  if (level === 2) {
    let a: [number, number], b: [number, number];
    do {
      a = properFrac(r, [3, 4, 5, 6, 7, 8, 9]);
      b = properFrac(r, [3, 4, 5, 6, 7, 8, 9]);
    } while (a[1] === b[1]);
    const L = lcm(a[1], b[1]);
    const an = (a[0] * L) / a[1];
    const bn = (b[0] * L) / b[1];
    const sign = an > bn ? ">" : an < bn ? "<" : "=";
    const opts = [">", "<", "="].map((s) => `${rawFrac(...a)} ${s} ${rawFrac(...b)}`);
    return {
      text: `Аль нь зөв бэ? ${rawFrac(...a)} ба ${rawFrac(...b)}-ийг жиш.`,
      ans: pick(`${rawFrac(...a)} ${sign} ${rawFrac(...b)}`),
      wrong: opts.filter((o) => !o.includes(` ${sign} `)),
      steps: [`Ерөнхий хуваарь ${L}: ${rawFrac(an, L)} ба ${rawFrac(bn, L)}.`, `${an} ${sign} ${bn} тул ${rawFrac(...a)} ${sign} ${rawFrac(...b)}.`],
    };
  }
  const seen = new Map<number, string>();
  while (seen.size < 4) {
    const [p, q] = properFrac(r, [3, 4, 5, 6, 8, 9, 10, 12]);
    if (!seen.has(p / q)) seen.set(p / q, rawFrac(p, q));
  }
  const entries = [...seen.entries()];
  const best = entries.reduce((a, b) => (b[0] > a[0] ? b : a));
  return {
    text: `Аль бутархай хамгийн их вэ? ${entries.map((e) => e[1]).join(";  ")}`,
    ans: pick(best[1]),
    wrong: entries.filter((e) => e !== best).map((e) => e[1]),
    steps: ["Бүгдийг ерөнхий хуваарьт шилжүүлж, эсвэл аравтын бутархай болгож жишнэ.", `Хамгийн их нь ${best[1]} ≈ ${fmt(round(best[0], 3))}.`],
  };
};

/* 3. Энгийн бутархайн үйлдэл */
const fractionOps: Generator = (level, r) => {
  if (level === 0) {
    const d = r.int(5, 12);
    const a = r.int(1, d - 2);
    const b = r.int(1, d - a - 1);
    const [n, m] = reduce(a + b, d);
    return {
      text: `${rawFrac(a, d)} + ${rawFrac(b, d)} = ?`,
      ans: fr(a + b, d),
      wrong: [rawFrac(a + b, 2 * d), frac(a * b, d), frac(a + b + 1, d)],
      steps: ["Хуваарь ижил тул хүртвэрүүдийг нэмнэ.", `${rawFrac(a + b, d)}${m !== d ? ` = ${rawFrac(n, m)}` : ""}`],
    };
  }
  const [a, b] = properFrac(r, [2, 3, 4, 5, 6, 8]);
  let c: number, d: number;
  do [c, d] = properFrac(r, [2, 3, 4, 5, 6, 8]);
  while (d === b);
  if (level === 1) {
    const sub = a / b > c / d && r.next() < 0.5;
    const L = lcm(b, d);
    const n = (a * L) / b + (sub ? -1 : 1) * ((c * L) / d);
    return {
      text: `${rawFrac(a, b)} ${sub ? "−" : "+"} ${rawFrac(c, d)} = ?`,
      ans: fr(n, L),
      wrong: [frac(sub ? a - c : a + c, sub ? Math.abs(b - d) || 1 : b + d), frac(n + 1, L), frac(sub ? a * d + c * b : a * d - c * b, b * d)],
      steps: [`Ерөнхий хуваарь ${L}.`, `${rawFrac((a * L) / b, L)} ${sub ? "−" : "+"} ${rawFrac((c * L) / d, L)} = ${rawFrac(n, L)}${gcd(n, L) > 1 ? ` = ${frac(n, L)}` : ""}`],
    };
  }
  if (level === 2) {
    return {
      text: `${rawFrac(a, b)} · ${rawFrac(c, d)} = ?`,
      ans: fr(a * c, b * d),
      wrong: [frac(a * d, b * c), frac(a + c, b + d), frac(a * c, b + d)],
      steps: ["Хүртвэрийг хүртвэрээр, хуваарийг хуваариар үржүүлнэ.", `${rawFrac(a * c, b * d)} = ${frac(a * c, b * d)}`],
    };
  }
  return {
    text: `${rawFrac(a, b)} : ${rawFrac(c, d)} = ?`,
    ans: fr(a * d, b * c),
    wrong: [frac(a * c, b * d), frac(b * c, a * d), frac(a + d, b + c)],
    steps: [`Хуваахдаа хуваагчийн урвуугаар үржүүлнэ: ${rawFrac(a, b)} · ${rawFrac(d, c)}.`, `${rawFrac(a * d, b * c)} = ${frac(a * d, b * c)}`],
  };
};

/* 4. Энгийн ба аравтын бутархай, процент */
const decimalsPercent: Generator = (level, r) => {
  if (level === 0) {
    const [p, q] = properFrac(r, [2, 4, 5, 10, 20, 25]);
    const v = p / q;
    return {
      text: `${rawFrac(p, q)}-ийг аравтын бутархай болго.`,
      ans: num(v),
      wrong: wn([Number(`0.${p}${q}`), q / p > 10 ? v * 10 : round(q / p), v * 10]),
      steps: [`${p} : ${q} = ${fmt(v)}`, `Эсвэл хуваарийг 10, 100-д хүргэнэ: ${rawFrac((p * 100) / q, 100)} = ${fmt(v)}.`],
    };
  }
  if (level === 1) {
    const v = r.int(1, 99) / 100;
    return {
      text: `${fmt(v)}-ийг процентоор илэрхийл.`,
      ans: num(v * 100, "%"),
      wrong: wn([v * 10, v, v * 1000], "%"),
      steps: ["Процент гэдэг нь 100-ийн хэсэг: 100-аар үржүүлнэ.", `${fmt(v)} · 100 = ${fmt(v * 100)}%`],
    };
  }
  if (level === 2) {
    const p = r.pick([5, 15, 20, 25, 35, 40, 45, 55, 60, 65, 75, 80, 85]);
    return {
      text: `${p}%-ийг хураагдсан энгийн бутархай болго.`,
      ans: fr(p, 100),
      wrong: [rawFrac(p, 10), frac(100, p), frac(p + 5, 100)],
      steps: [`${p}% = ${rawFrac(p, 100)}`, `ХИЕХ(${p}, 100) = ${gcd(p, 100)} тул ${frac(p, 100)}`],
    };
  }
  const [p, q] = properFrac(r, [8, 16, 40, 20, 25]);
  const v = (p / q) * 100;
  return {
    text: `${rawFrac(p, q)}-ийг процентоор илэрхийл.`,
    ans: num(v, "%"),
    wrong: wn([p, round(v / 10), round(v + 10)], "%"),
    steps: [`${p} : ${q} = ${fmt(p / q)}`, `${fmt(p / q)} · 100 = ${fmt(v)}%`],
  };
};

/* 5. Харьцаа, пропорц */
const ratio: Generator = (level, r) => {
  if (level === 0) {
    let p: number, q: number;
    do {
      p = r.int(1, 9);
      q = r.int(1, 9);
    } while (gcd(p, q) !== 1 || p === q);
    const k = r.int(2, 9);
    return {
      text: `${p * k} : ${q * k} харьцааг хураа.`,
      ans: pick(`${p} : ${q}`),
      wrong: [`${q} : ${p}`, `${p * k} : ${q}`, `${p + 1} : ${q + 1}`],
      steps: [`ХИЕХ(${p * k}, ${q * k}) = ${k}.`, `Хоёр гишүүнийг ${k}-д хуваана: ${p} : ${q}.`],
    };
  }
  if (level === 1) {
    const b = r.int(2, 9);
    const a = r.int(1, 12);
    const k = r.int(2, 6);
    const d = b * k;
    return {
      text: `[[${a}/${b}]] = [[x/${d}]] пропорцоос x-ийг ол.`,
      ans: num(a * k),
      wrong: wn([a + (d - b), (a * b) / d === Math.round((a * b) / d) ? (a * b) / d : a * k + 1, d]),
      steps: [`Хуваарь ${b}-оос ${d} болохдоо ${k} дахин өссөн.`, `x = ${a} · ${k} = ${a * k}`],
    };
  }
  if (level === 2) {
    const p = r.int(1, 5);
    const q = r.int(p + 1, 9);
    const unit = r.int(20, 200) * 10;
    const total = (p + q) * unit;
    return {
      text: `${fmt(total)}₮-ийг ${p} : ${q} харьцаагаар хуваав. Их хэсэг нь хэдэн төгрөг вэ?`,
      ans: num(q * unit, "₮"),
      wrong: wn([p * unit, total / 2, (total / q) * p], "₮"),
      steps: [`Нийт хэсэг: ${p} + ${q} = ${p + q}.`, `1 хэсэг: ${fmt(total)} : ${p + q} = ${fmt(unit)}₮.`, `Их хэсэг: ${q} · ${fmt(unit)} = ${fmt(q * unit)}₮.`],
    };
  }
  const w1 = r.pick([2, 3, 4, 6]);
  const days = r.pick([6, 8, 10, 12, 15]);
  // Хариу бүхэл гарах ажилчдын тоо (w1-ээс их)
  const total = w1 * days;
  const options = Array.from({ length: total }, (_, i) => i + 1).filter((w) => w > w1 && w <= w1 * 4 && total % w === 0);
  const w2 = r.pick(options.length ? options : [w1 * 2]);
  const ans = (w1 * days) / w2;
  return {
    text: `${w1} ажилчин нэг ажлыг ${days} өдөрт хийдэг. Яг адил хурдтай ${w2} ажилчин уг ажлыг хэдэн өдөрт хийх вэ?`,
    ans: num(ans, "өдөр"),
    wrong: wn([(days * w2) / w1, days - (w2 - w1), ans + 1], "өдөр"),
    steps: ["Ажилчин олшрох тусам хугацаа багасна — урвуу пропорц.", `Нийт ажил: ${w1} · ${days} = ${w1 * days} хүн-өдөр.`, `${w1 * days} : ${w2} = ${fmt(ans)} өдөр.`],
  };
};

/* 6. Процент, хэсгийн бодлого */
const percentProblems: Generator = (level, r) => {
  if (level === 0) {
    const p = r.pick([5, 10, 15, 20, 25, 50, 75]);
    const n = r.int(2, 20) * 20;
    const v = (n * p) / 100;
    return {
      text: `${n}-ийн ${p}% хэд вэ?`,
      ans: num(v),
      wrong: wn([n / p, v * 10, n - v]),
      steps: [`${p}% = ${fmt(p / 100)}.`, `${n} · ${fmt(p / 100)} = ${fmt(v)}`],
    };
  }
  if (level === 1) {
    const p = r.pick([10, 20, 25, 40, 50]);
    const whole = r.int(2, 30) * 10;
    const part = (whole * p) / 100;
    return {
      text: `Нэг тооны ${p}% нь ${fmt(part)}. Тэр тоо хэд вэ?`,
      ans: num(whole),
      wrong: wn([(part * p) / 100, part + p, whole / 2]),
      steps: [`Тоо = хэсэг : (${p}/100).`, `${fmt(part)} : ${fmt(p / 100)} = ${fmt(whole)}`],
    };
  }
  if (level === 2) {
    const price = r.int(4, 60) * 500;
    const p = r.pick([10, 15, 20, 25, 30, 40]);
    const off = (price * p) / 100;
    return {
      text: `${fmt(price)}₮-ийн бараа ${p}% хямдарвал хэдэн төгрөг болох вэ?`,
      ans: num(price - off, "₮"),
      wrong: wn([off, price - p, price + off], "₮"),
      steps: [`Хямдрал: ${fmt(price)} · ${fmt(p / 100)} = ${fmt(off)}₮.`, `Шинэ үнэ: ${fmt(price)} − ${fmt(off)} = ${fmt(price - off)}₮.`],
    };
  }
  const a = r.int(2, 20) * 20;
  const p = r.pick([5, 10, 15, 20, 25, 30, 40, 50]) * r.sign();
  const b = a + (a * p) / 100;
  const up = p > 0;
  return {
    text: `Үнэ ${fmt(a)}₮-өөс ${fmt(b)}₮ болж ${up ? "нэмэгдсэн" : "буурсан"}. Хэдэн хувиар ${up ? "нэмэгдсэн" : "буурсан"} бэ?`,
    ans: num(Math.abs(p), "%"),
    wrong: wn([Math.abs(b - a), round((Math.abs(b - a) / b) * 100, 1), Math.abs(p) * 2], "%"),
    steps: [`Өөрчлөлт: |${fmt(b)} − ${fmt(a)}| = ${fmt(Math.abs(b - a))}.`, `Анхны утгад харьцуулна: ${fmt(Math.abs(b - a))} : ${fmt(a)} · 100 = ${fmt(Math.abs(p))}%.`],
  };
};

/* 7. Нэгж шилжүүлэх */
const units: Generator = (level, r) => {
  if (level === 0) {
    const c = r.pick([
      { from: "м", to: "см", k: 100 },
      { from: "км", to: "м", k: 1000 },
      { from: "кг", to: "г", k: 1000 },
      { from: "л", to: "мл", k: 1000 },
    ]);
    const v = r.int(2, 30);
    return {
      text: `${v} ${c.from} = ? ${c.to}`,
      ans: num(v * c.k, c.to),
      wrong: wn([v * c.k * 10, v * (c.k / 10), v / c.k], c.to),
      steps: [`1 ${c.from} = ${fmt(c.k)} ${c.to}.`, `${v} · ${fmt(c.k)} = ${fmt(v * c.k)} ${c.to}`],
    };
  }
  if (level === 1) {
    const c = r.pick([
      { from: "см", to: "м", k: 100 },
      { from: "г", to: "кг", k: 1000 },
      { from: "м", to: "км", k: 1000 },
    ]);
    const v = r.int(105, 9950);
    return {
      text: `${fmt(v)} ${c.from} = ? ${c.to}`,
      ans: num(v / c.k, c.to),
      wrong: wn([v / (c.k / 10), v / (c.k * 10), v * c.k], c.to),
      steps: [`1 ${c.to} = ${fmt(c.k)} ${c.from} тул ${fmt(c.k)}-д хуваана.`, `${fmt(v)} : ${fmt(c.k)} = ${fmt(v / c.k)} ${c.to}`],
    };
  }
  if (level === 2) {
    const h = r.int(1, 5);
    const m = r.int(5, 55);
    return {
      text: `${h} цаг ${m} минут = ? минут`,
      ans: num(h * 60 + m, "минут"),
      wrong: wn([h * 100 + m, h + m, h * 60], "минут"),
      steps: ["1 цаг = 60 минут.", `${h} · 60 + ${m} = ${h * 60 + m} минут`],
    };
  }
  const c = r.pick([
    { from: "м²", to: "см²", k: 10000, note: "1 м = 100 см тул 1 м² = 100 · 100 = 10 000 см²." },
    { from: "дм³", to: "см³", k: 1000, note: "1 дм = 10 см тул 1 дм³ = 10 · 10 · 10 = 1000 см³." },
    { from: "км²", to: "га", k: 100, note: "1 км² = 1 000 000 м², 1 га = 10 000 м² тул 1 км² = 100 га." },
  ]);
  const v = r.int(2, 12);
  return {
    text: `${v} ${c.from} = ? ${c.to}`,
    ans: num(v * c.k, c.to),
    wrong: wn([v * Math.sqrt(c.k), v * c.k * 10, v * 100 === v * c.k ? v * 10 : v * 100], c.to),
    steps: [c.note, `${v} · ${fmt(c.k)} = ${fmt(v * c.k)} ${c.to}`],
  };
};

export const NUMBER_GENERATORS = [compareRound, simplifyCompare, fractionOps, decimalsPercent, ratio, percentProblems, units];
