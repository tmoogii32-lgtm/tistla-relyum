/* Хүрээ 4 — Статистик ба магадлал (4 сэдэв) */

import { fmt, fr, frac, num, pick, rawFrac, reduce, round, wn, type Generator, type Rng } from "./core";

const list = (xs: number[]) => xs.map(fmt).join(", ");
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** n ширхэг [lo; hi] бүхэл тоо */
const sample = (r: Rng, n: number, lo: number, hi: number) => Array.from({ length: n }, () => r.int(lo, hi));

/* 17. Өгөгдлийг бүлэглэх */
const grouping: Generator = (level, r) => {
  if (level === 0) {
    const data = sample(r, 12, 1, 6);
    const v = r.pick(data);
    const c = data.filter((x) => x === v).length;
    return {
      text: `12 сурагчийн гэрийн даалгавар хийсэн цаг: ${list(data)}. ${v} гэсэн утгын давтамж хэд вэ?`,
      ans: num(c),
      wrong: wn([c + 1, v, c - 1 || c + 2]),
      steps: [`${v} гэсэн утгыг тоолно.`, `Давтамж = ${c}`],
    };
  }
  if (level === 1) {
    const data = sample(r, 15, 1, 30);
    const lo = r.pick([1, 6, 11, 16, 21]);
    const hi = lo + 4;
    const c = data.filter((x) => x >= lo && x <= hi).length;
    return {
      text: `Өгөгдөл: ${list(data)}. [${lo}; ${hi}] завсарт хэдэн утга орох вэ?`,
      ans: num(c),
      wrong: wn([c + 1, c === 0 ? 2 : c - 1, data.filter((x) => x > lo && x < hi).length === c ? c + 2 : data.filter((x) => x > lo && x < hi).length]),
      steps: [`${lo}-ээс ${hi} хүртэлх (хоёр үзүүрийг оруулан) утгуудыг тоолно.`, `Давтамж = ${c}`],
    };
  }
  if (level === 2) {
    const n = r.pick([20, 25, 40, 50]);
    const k = r.int(2, n / 2);
    const p = (k / n) * 100;
    return {
      text: `${n} сурагчаас ${k} нь өглөө 7 цагаас өмнө босдог. Харьцангуй давтамжийг процентоор ол.`,
      ans: num(p, "%"),
      wrong: wn([k, round((n / k) * 10, 1), 100 - p], "%"),
      steps: ["Харьцангуй давтамж = давтамж / нийт · 100%", `${k} / ${n} · 100% = ${fmt(p)}%`],
    };
  }
  const a = r.int(2, 9);
  const b = r.int(3, 12);
  const c = r.int(1, 10);
  const total = a + b + c + r.int(2, 8);
  const missing = total - a - b - c;
  return {
    text: `Давтамжийн хүснэгт: 0–4 оноо: ${a}, 5–9 оноо: ${b}, 10–14 оноо: ${c}, 15–19 оноо: ?. Нийт ${total} сурагч бол сүүлийн бүлгийн давтамж хэд вэ?`,
    ans: num(missing),
    wrong: wn([total - a - b, a + b + c, missing + 1]),
    steps: ["Бүх бүлгийн давтамжийн нийлбэр нийт тоотой тэнцүү.", `${total} − (${a} + ${b} + ${c}) = ${missing}`],
  };
};

/* 18. Өгөгдлийг дүрслэх */
const charts: Generator = (level, r) => {
  if (level === 0) {
    const p = r.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75]);
    return {
      text: `Дугуй диаграммд ${p}%-ийг илэрхийлэх секторын төв өнцөг хэдэн градус вэ?`,
      ans: num((360 * p) / 100, "°"),
      wrong: wn([p, (180 * p) / 100, (360 * p) / 100 + 10], "°"),
      steps: ["Бүтэн тойрог 360° = 100%.", `360° · ${p}/100 = ${fmt((360 * p) / 100)}°`],
    };
  }
  if (level === 1) {
    const n = r.pick([20, 24, 30, 36, 40, 45, 60]);
    const k = r.int(1, n - 1);
    const ang = (360 * k) / n;
    if (ang !== Math.round(ang)) return charts(1, r);
    return {
      text: `${n} сурагчаас ${k} нь сагсан бөмбөгт дуртай. Дугуй диаграммд энэ бүлгийн секторын өнцөг хэд вэ?`,
      ans: num(ang, "°"),
      wrong: wn([k, (k / n) * 100, ang / 2], "°"),
      steps: [`Нэг сурагчид ногдох өнцөг: 360° : ${n} = ${fmt(360 / n)}°.`, `${k} · ${fmt(360 / n)}° = ${fmt(ang)}°`],
    };
  }
  if (level === 2) {
    const cats = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан"];
    const vals = sample(r, 5, 5, 40);
    const d = Math.max(...vals) - Math.min(...vals);
    return {
      text: `Баганан диаграммын өгөгдөл (номын сангийн уншигч): ${cats.map((c, i) => `${c} ${vals[i]}`).join(", ")}. Хамгийн өндөр ба хамгийн нам баганын зөрүү хэд вэ?`,
      ans: num(d),
      wrong: wn([Math.max(...vals), Math.max(...vals) + Math.min(...vals), d + 1]),
      steps: [`Хамгийн их ${Math.max(...vals)}, хамгийн бага ${Math.min(...vals)}.`, `${Math.max(...vals)} − ${Math.min(...vals)} = ${d}`],
    };
  }
  if (r.next() < 0.7) {
    // Пиктограмм / баганан диаграммын масштаб
    const unit = r.pick([2, 4, 5, 10, 20]);
    const cells = r.int(3, 12) + (r.next() < 0.4 ? 0.5 : 0);
    const v = unit * cells;
    if (v !== Math.round(v)) return charts(3, r);
    return {
      text: `Пиктограммд нэг дүрс ${unit} сурагчийг илэрхийлдэг. "Шатар" мөрөнд ${fmt(cells)} дүрс байгаа бол хэдэн сурагч шатарт дуртай вэ?`,
      ans: num(v, "сурагч"),
      wrong: wn([cells, unit + cells, Math.floor(cells) * unit === v ? v + unit : Math.floor(cells) * unit], "сурагч"),
      steps: [`Нэг дүрс = ${unit} сурагч${cells % 1 ? `, хагас дүрс = ${unit / 2} сурагч` : ""}.`, `${fmt(cells)} · ${unit} = ${fmt(v)} сурагч`],
    };
  }
  const q = r.pick([
    { text: "Ангийн сурагчдын дуртай спортын төрлийг бүхэлд нь эзлэх хувиар харуулахад аль диаграмм хамгийн тохиромжтой вэ?", ans: "Дугуй диаграмм", why: "Хэсэг бүхэлдээ хэдэн хувийг эзлэхийг дугуй диаграмм илүү тод харуулна." },
    { text: "Нэг сарын туршид өдөр бүрийн агаарын температурын өөрчлөлтийг харуулахад аль диаграмм хамгийн тохиромжтой вэ?", ans: "Шугаман диаграмм", why: "Цаг хугацааны дагуух өөрчлөлтийг шугаман диаграмм харуулна." },
    { text: "Таван ангийн сурагчдын тоог хооронд нь харьцуулахад аль диаграмм хамгийн тохиромжтой вэ?", ans: "Баганан диаграмм", why: "Ангиллуудын хэмжээг харьцуулахад баганан диаграмм тохиромжтой." },
  ]);
  const all = ["Дугуй диаграмм", "Шугаман диаграмм", "Баганан диаграмм", "Давтамжийн хүснэгт"];
  return { text: q.text, ans: pick(q.ans), wrong: all.filter((a) => a !== q.ans), steps: [q.why] };
};

/* 19. Дунджууд ба далайц */
const averages: Generator = (level, r) => {
  if (level === 0) {
    const mean = r.int(4, 15);
    const xs = sample(r, 4, mean - 4, mean + 4);
    xs.push(mean * 5 - sum(xs));
    return {
      text: `${list(r.shuffle(xs))} тоонуудын арифметик дундаж хэд вэ?`,
      ans: num(mean),
      wrong: wn([sum(xs), round(sum(xs) / 4, 2), mean + 1]),
      steps: [`Нийлбэр: ${sum(xs)}.`, `${sum(xs)} : 5 = ${mean}`],
    };
  }
  if (level === 1) {
    const xs = sample(r, 7, 1, 30);
    const sorted = [...xs].sort((a, b) => a - b);
    const med = sorted[3];
    return {
      text: `${list(xs)} өгөгдлийн медианыг ол.`,
      ans: num(med),
      wrong: wn([xs[3] === med ? sorted[2] : xs[3], round(sum(xs) / 7, 1), sorted[4] === med ? med + 1 : sorted[4]]),
      steps: [`Өсөх дарааллаар: ${list(sorted)}.`, `Голын (4-р) утга: ${med}`],
    };
  }
  if (level === 2) {
    const xs = sample(r, 8, -5, 25);
    const range = Math.max(...xs) - Math.min(...xs);
    return {
      text: `${list(xs)} өгөгдлийн далайцыг ол.`,
      ans: num(range),
      wrong: wn([Math.max(...xs), Math.max(...xs) + Math.min(...xs) === range ? range + 2 : Math.max(...xs) + Math.min(...xs), Math.max(...xs) - Math.abs(Math.min(...xs)) === range ? range - 1 : Math.max(...xs) - Math.abs(Math.min(...xs))]),
      steps: ["Далайц = хамгийн их − хамгийн бага.", `${fmt(Math.max(...xs))} − (${fmt(Math.min(...xs))}) = ${fmt(range)}`],
    };
  }
  const mean = r.int(5, 12);
  const n = 5;
  const known = sample(r, n - 1, mean - 4, mean + 4);
  const missing = mean * n - sum(known);
  if (missing < 0 || missing > 30) return averages(3, r);
  return {
    text: `5 сурагчийн оноо: ${list(known)}, ?. Дундаж оноо ${mean} бол үл мэдэгдэх оноо хэд вэ?`,
    ans: num(missing),
    wrong: wn([mean, round(sum(known) / 4, 2), missing + n]),
    steps: [`5 онооны нийлбэр: ${mean} · 5 = ${mean * 5}.`, `${mean * 5} − ${sum(known)} = ${missing}`],
  };
};

/* 20. Эсрэг үзэгдлийн магадлал */
const probability: Generator = (level, r) => {
  if (level === 0) {
    const red = r.int(1, 9);
    const blue = r.int(1, 9);
    const t = red + blue;
    return {
      text: `Уутанд ${red} улаан, ${blue} цэнхэр бөмбөг бий. Санамсаргүй нэгийг авахад улаан байх магадлал?`,
      ans: fr(red, t),
      wrong: [frac(blue, t), red !== blue ? rawFrac(red, blue) : "", frac(1, t), frac(red, t + 1), frac(red + 1, t)].filter(
        (w) => w && w !== frac(red, t),
      ),
      steps: [`Нийт ${t} бөмбөг, тохиромжтой ${red}.`, `P = ${rawFrac(red, t)}${reduce(red, t)[1] !== t ? ` = ${frac(red, t)}` : ""}`],
    };
  }
  if (level === 1) {
    const d = r.pick([5, 6, 8, 9, 10, 12]);
    const n = r.int(1, d - 1);
    return {
      text: `P(A) = ${rawFrac(n, d)} бол эсрэг үзэгдлийн магадлал P(A′) хэд вэ?`,
      ans: fr(d - n, d),
      wrong: [rawFrac(d, n), frac(n, d - n === n ? d + 1 : d), frac(1, d)].filter((w) => w !== frac(d - n, d)),
      steps: ["P(A′) = 1 − P(A)", `1 − ${rawFrac(n, d)} = ${rawFrac(d - n, d)}${reduce(d - n, d)[1] !== d ? ` = ${frac(d - n, d)}` : ""}`],
    };
  }
  if (level === 2) {
    const p = r.int(5, 95) / 100;
    return {
      text: `Маргааш бороо орох магадлал ${fmt(p)}. Бороо орохгүй байх магадлал хэд вэ?`,
      ans: num(1 - p),
      wrong: wn([p, round(1 - p + 0.1), round(100 - p * 100)]),
      steps: ["P(A′) = 1 − P(A)", `1 − ${fmt(p)} = ${fmt(1 - p)}`],
    };
  }
  // Шоо (6 талт) эсвэл 1–n дугаартай карт
  const n = r.pick([6, 6, 8, 10, 12]);
  const k = r.int(1, n - 1);
  const above = r.next() < 0.5;
  const fav = above ? n - k : k - 1; // A үзэгдэлд тохирох боломж
  if (fav === 0) return probability(3, r);
  const what = n === 6 ? "Шоо нэг удаа хаяв." : `1-ээс ${n} хүртэл дугаартай ${n} картаас нэгийг санамсаргүй авав.`;
  const cond = above ? `${k}-аас их` : `${k}-аас бага`;
  const comp = n - fav;
  return {
    text: `${what} ${cond} тоо ${n === 6 ? "буухгүй" : "гарахгүй"} байх магадлал хэд вэ?`,
    ans: fr(comp, n),
    wrong: [frac(fav, n), frac(comp - 1 || comp + 1, n), frac(1, n), frac(comp, n + 1)].filter((w) => w !== frac(comp, n)),
    steps: [
      `A: ${cond} тоо — ${fav} боломж, P(A) = ${rawFrac(fav, n)}.`,
      `P(A′) = 1 − ${rawFrac(fav, n)} = ${rawFrac(comp, n)}${reduce(comp, n)[1] !== n ? ` = ${frac(comp, n)}` : ""}`,
    ],
  };
};

export const STATISTICS_GENERATORS = [grouping, charts, averages, probability];
