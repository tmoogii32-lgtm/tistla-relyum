/* Хүрээ 2 — Алгебр (5 сэдэв) */

import { fmt, joinTerms, lineEq, num, pick, pt, round, term, wn, type Generator, type Rng } from "./core";

const nz = (r: Rng, a: number, b: number) => {
  let v = 0;
  while (v === 0) v = r.int(a, b);
  return v;
};

/* 8. Алгебрын илэрхийлэл */
const expressions: Generator = (level, r) => {
  if (level === 0) {
    const a = r.int(2, 9);
    const b = r.int(1, 15);
    const x = r.int(2, 9);
    return {
      text: `x = ${x} үед ${a}x + ${b} илэрхийллийн утгыг ол.`,
      ans: num(a * x + b),
      wrong: wn([a + x + b, Number(`${a}${x}`) + b, a * (x + b)]),
      steps: [`x-ийн оронд ${x}-ийг орлуулна: ${a} · ${x} + ${b}.`, `${a * x} + ${b} = ${a * x + b}`],
    };
  }
  if (level === 1) {
    const a = r.int(2, 9);
    const b = r.int(2, 9);
    const c = r.int(1, a + b - 1);
    const s = a + b - c;
    return {
      text: `Хялбарчил: ${a}x + ${b}x − ${c}x`,
      ans: pick(term(s)),
      wrong: [fmt(s), term(a + b + c), `${fmt(s)}x²`],
      steps: ["Төсөөтэй гишүүдийн коэффициентийг нэмж хасна.", `(${a} + ${b} − ${c})x = ${term(s)}`],
    };
  }
  if (level === 2) {
    const a = nz(r, -6, 9);
    const b = nz(r, -9, 9);
    const right = joinTerms([term(a), fmt(a * b)]);
    return {
      text: `Хаалтыг задал: ${fmt(a)}(x ${b > 0 ? "+" : "−"} ${Math.abs(b)})`,
      ans: pick(right),
      wrong: [joinTerms([term(a), fmt(b)]), joinTerms([term(a), fmt(-a * b)]), joinTerms([term(a + b), fmt(a * b)])].filter((w) => w !== right),
      steps: ["Хаалтын өмнөх тоог хаалтан доторх гишүүн бүрээр үржүүлнэ.", `${fmt(a)} · x ${a * b >= 0 ? "+" : "−"} ${fmt(Math.abs(a))} · ${fmt(Math.abs(b))} = ${right}`],
    };
  }
  const a = r.int(1, 4);
  const b = r.int(-6, 6);
  const c = r.int(-9, 9);
  const x = nz(r, -4, 4);
  const v = a * x * x + b * x + c;
  return {
    text: `x = ${fmt(x)} үед ${joinTerms([term(a, "x²"), b ? term(b) : "", c ? fmt(c) : ""])} илэрхийллийн утгыг ол.`,
    ans: num(v),
    wrong: wn([-a * x * x + b * x + c, a * 2 * x + b * x + c, v + 2 * b * x || v + 1]),
    steps: [`x² = (${fmt(x)})² = ${x * x} (сөрөг тооны квадрат эерэг).`, `${a} · ${x * x} ${b * x >= 0 ? "+" : "−"} ${fmt(Math.abs(b * x))} ${c >= 0 ? "+" : "−"} ${fmt(Math.abs(c))} = ${fmt(v)}`],
  };
};

/* 9. Дараалал */
const sequences: Generator = (level, r) => {
  if (level === 0) {
    const a = r.int(-10, 20);
    const d = nz(r, -7, 9);
    const s = [0, 1, 2, 3].map((i) => a + i * d);
    return {
      text: `Дарааллын дараагийн гишүүнийг ол: ${s.map(fmt).join(";  ")};  …`,
      ans: num(a + 4 * d),
      wrong: wn([a + 4 * d + 1, a + 5 * d, s[3] - d]),
      steps: [`Зэргэлдээ гишүүдийн зөрүү: ${fmt(s[1])} − ${fmt(s[0])} = ${fmt(d)}.`, `${fmt(s[3])} + (${fmt(d)}) = ${fmt(a + 4 * d)}`],
    };
  }
  if (level === 1) {
    const a = r.int(1, 6);
    const q = r.pick([2, 3, -2]);
    const s = [0, 1, 2, 3].map((i) => a * q ** i);
    return {
      text: `Дарааллын дараагийн гишүүнийг ол: ${s.map(fmt).join(";  ")};  …`,
      ans: num(a * q ** 4),
      wrong: wn([s[3] + (s[3] - s[2]), s[3] * (q + 1), -a * q ** 4]),
      steps: [`Гишүүн бүр өмнөхөөсөө ${fmt(q)} дахин: ${fmt(s[1])} : ${fmt(s[0])} = ${fmt(q)}.`, `${fmt(s[3])} · ${fmt(q)} = ${fmt(a * q ** 4)}`],
    };
  }
  if (level === 2) {
    const a = r.int(1, 12);
    const d = r.int(2, 8);
    const n = r.int(8, 15);
    return {
      text: `${a};  ${a + d};  ${a + 2 * d};  … дарааллын ${n}-р гишүүн хэд вэ?`,
      ans: num(a + (n - 1) * d),
      wrong: wn([a + n * d, n * d, a + (n - 2) * d]),
      steps: [`Эхний гишүүн ${a}, алхам ${d}.`, `${n}-р гишүүн хүртэл ${n - 1} алхам: ${a} + ${n - 1} · ${d} = ${a + (n - 1) * d}`],
    };
  }
  const first = r.int(3, 6);
  const add = r.int(2, 5);
  const n = r.int(8, 20);
  return {
    text: `Шүдэнзээр дүрс зохиов. 1-р дүрсэнд ${first} шүдэнз, дараагийн дүрс бүрт ${add} шүдэнз нэмэгддэг. ${n}-р дүрсэнд хэдэн шүдэнз байх вэ?`,
    ans: num(first + (n - 1) * add, "шүдэнз"),
    wrong: wn([first + n * add, n * add, first * n], "шүдэнз"),
    steps: [`Дүрсүүд: ${first}, ${first + add}, ${first + 2 * add}, … (алхам ${add}).`, `${first} + (${n} − 1) · ${add} = ${first + (n - 1) * add}`],
  };
};

/* 10. Арифметик прогрессийн ерөнхий гишүүний томьёо */
const apFormula: Generator = (level, r) => {
  if (level === 0) {
    const a1 = r.int(-5, 15);
    const d = nz(r, -4, 6);
    const n = r.int(6, 20);
    return {
      text: `Арифметик прогрессийн a₁ = ${fmt(a1)}, d = ${fmt(d)}. a${sub(n)}-ийг ол.`,
      ans: num(a1 + (n - 1) * d),
      wrong: wn([a1 + n * d, a1 * n + d, (a1 + d) * (n - 1)]),
      steps: ["aₙ = a₁ + (n − 1)d", `a${sub(n)} = ${fmt(a1)} + ${n - 1} · ${fmt(d)} = ${fmt(a1 + (n - 1) * d)}`],
    };
  }
  if (level === 1) {
    const a1 = r.int(-5, 12);
    const d = nz(r, -5, 7);
    const c = a1 - d;
    const mk = (k: number, b: number) => "aₙ = " + joinTerms([term(k, "n"), b ? fmt(b) : ""]);
    const right = mk(d, c);
    return {
      text: `${[0, 1, 2, 3].map((i) => fmt(a1 + i * d)).join(";  ")};  … прогрессийн ерөнхий гишүүний томьёо аль нь вэ?`,
      ans: pick(right),
      wrong: [...new Set([mk(d, a1), mk(a1, d), mk(d, c + 1), mk(-d, c), mk(d + 1, c - 1)])].filter((w) => w !== right),
      steps: [`a₁ = ${fmt(a1)}, d = ${fmt(d)}.`, `aₙ = ${fmt(a1)} + (n − 1) · ${fmt(d)} = ${right.slice(5)}`],
    };
  }
  if (level === 2) {
    const k = r.int(2, 7);
    const b = r.int(-5, 9);
    const n = r.int(6, 25);
    const v = k * n + b;
    return {
      text: `aₙ = ${joinTerms([term(k, "n"), b ? fmt(b) : ""])} прогрессийн хэддүгээр гишүүн ${fmt(v)}-тэй тэнцүү вэ?`,
      ans: num(n),
      wrong: wn([n + 1, v / k === Math.round(v / k) && v / k !== n ? v / k : n - 1, k * v + b]),
      steps: [`${joinTerms([term(k, "n"), b ? fmt(b) : ""])} = ${fmt(v)}`, `${k}n = ${fmt(v - b)} → n = ${n}`],
    };
  }
  const a1 = r.int(-6, 10);
  const d = nz(r, -4, 6);
  const i = r.int(2, 4);
  const j = i + r.int(3, 6);
  const ai = a1 + (i - 1) * d;
  const aj = a1 + (j - 1) * d;
  return {
    text: `Арифметик прогрессийн a${sub(i)} = ${fmt(ai)}, a${sub(j)} = ${fmt(aj)}. a₁-ийг ол.`,
    ans: num(a1),
    wrong: wn([ai - i * d, d, ai - d * (j - i)]),
    steps: [`a${sub(j)} − a${sub(i)} = ${j - i}d → ${fmt(aj - ai)} = ${j - i}d → d = ${fmt(d)}.`, `a₁ = a${sub(i)} − ${i - 1}d = ${fmt(ai)} − ${fmt((i - 1) * d)} = ${fmt(a1)}`],
  };
};

/* 11. Шугаман функц, түүний график */
const linearFunction: Generator = (level, r) => {
  const k = nz(r, -5, 5);
  const b = r.int(-8, 8);
  if (level === 0) {
    const x = r.int(-4, 6);
    return {
      text: `${lineEq(k, b)} функцийн x = ${fmt(x)} үеийн утгыг ол.`,
      ans: num(k * x + b),
      wrong: wn([k * x - b, k + x + b, -(k * x) + b]),
      steps: [`y = ${fmt(k)} · ${fmt(x)} ${b >= 0 ? "+" : "−"} ${fmt(Math.abs(b))}`, `y = ${fmt(k * x + b)}`],
    };
  }
  if (level === 1) {
    const x1 = r.int(-5, 3);
    const x2 = x1 + r.int(1, 4);
    const y1 = k * x1 + b;
    const y2 = k * x2 + b;
    return {
      text: `Шулуун ${pt(x1, y1)} ба ${pt(x2, y2)} цэгүүдийг дайрна. Налалтын коэффициент k-г ол.`,
      ans: num(k),
      wrong: wn([-k, (x2 - x1) / (y2 - y1) === k ? k + 1 : round((x2 - x1) / (y2 - y1), 2), y2 - y1]),
      steps: ["k = (y₂ − y₁) / (x₂ − x₁)", `k = (${fmt(y2)} − ${fmt(y1)}) / (${fmt(x2)} − ${fmt(x1)}) = ${fmt(y2 - y1)} / ${x2 - x1} = ${fmt(k)}`],
    };
  }
  if (level === 2) {
    const x = r.int(-6, 6);
    const c = k * x;
    return {
      text: `${lineEq(k, b)} функцийн утга ${fmt(c + b)}-тэй тэнцүү байх x-ийг ол.`,
      ans: num(x),
      wrong: wn([-x, (c - b) / k === x ? x + 1 : round((c - b) / k, 2), c + b - b * 2]),
      steps: [`${lineEq(k, b).slice(4)} = ${fmt(c + b)}`, `${term(k)} = ${fmt(c)} → x = ${fmt(x)}`],
    };
  }
  const x = r.int(-4, 4);
  const y = k * x + b;
  return {
    text: `Аль цэг ${lineEq(k, b)} шулуун дээр орших вэ?`,
    ans: pick(pt(x, y)),
    wrong: [pt(x, y + 1), pt(y, x) === pt(x, y) ? pt(x + 1, y) : pt(y, x), pt(x, -y === y ? y - 2 : -y)],
    steps: [`Цэгийн x-ийг орлуулж y-тэй тэнцэх эсэхийг шалгана.`, `x = ${fmt(x)}: y = ${fmt(k)} · ${fmt(x)} ${b >= 0 ? "+" : "−"} ${fmt(Math.abs(b))} = ${fmt(y)} ✓`],
  };
};

/* 12. Шулууны тэгшитгэл бичих */
const lineEquation: Generator = (level, r) => {
  const k = nz(r, -4, 5);
  const b = nz(r, -7, 7);
  const right = lineEq(k, b);
  const distinct = (ws: string[]) => [...new Set(ws.filter((w) => w !== right))];
  if (level <= 1) {
    const text =
      level === 0
        ? `Налалт k = ${fmt(k)}, Oy тэнхлэгийг (0; ${fmt(b)}) цэгт огтлох шулууны тэгшитгэл аль нь вэ?`
        : `Шулуун ${pt(0, b)} цэгийг дайрч, x 1-ээр нэмэгдэхэд y ${fmt(Math.abs(k))}-ээр ${k > 0 ? "нэмэгддэг" : "буурдаг"}. Тэгшитгэл нь аль вэ?`;
    return {
      text,
      ans: pick(right),
      wrong: distinct([lineEq(b, k), lineEq(-k, b), lineEq(k, -b)]),
      steps: ["y = kx + b: k — налалт, b — Oy тэнхлэгийг огтлох цэг.", `k = ${fmt(k)}, b = ${fmt(b)} → ${right}`],
    };
  }
  if (level === 2) {
    const x1 = r.int(-3, 2);
    const x2 = x1 + r.int(1, 3);
    return {
      text: `${pt(x1, k * x1 + b)} ба ${pt(x2, k * x2 + b)} цэгүүдийг дайрах шулууны тэгшитгэл аль нь вэ?`,
      ans: pick(right),
      wrong: distinct([lineEq(-k, b), lineEq(k, b + k), lineEq(b, k)]),
      steps: [
        `k = (${fmt(k * x2 + b)} − ${fmt(k * x1 + b)}) / (${fmt(x2)} − ${fmt(x1)}) = ${fmt(k)}.`,
        `b = y − kx = ${fmt(k * x1 + b)} − ${fmt(k)} · ${fmt(x1)} = ${fmt(b)} → ${right}`,
      ],
    };
  }
  const c = b + nz(r, -5, 5);
  const px = r.int(-3, 3);
  const py = k * px + b;
  return {
    text: `${lineEq(k, c)} шулуунтай параллель, ${pt(px, py)} цэгийг дайрах шулууны тэгшитгэл аль нь вэ?`,
    ans: pick(right),
    wrong: distinct([lineEq(k, c), lineEq(-k, py + k * px), lineEq(k, py)]),
    steps: [`Параллель шулуунуудын налалт тэнцүү: k = ${fmt(k)}.`, `b = ${fmt(py)} − ${fmt(k)} · ${fmt(px)} = ${fmt(b)} → ${right}`],
  };
};

/** Доод индекс тоо: 12 → ₁₂ */
function sub(n: number) {
  return String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);
}

export const ALGEBRA_GENERATORS = [expressions, sequences, apFormula, linearFunction, lineEquation];
