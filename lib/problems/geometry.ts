/* Хүрээ 3 — Геометр (4 сэдэв) */

import { fmt, num, pick, pt, wn, type Generator, type Rng } from "./core";

const nz = (r: Rng, a: number, b: number) => {
  let v = 0;
  while (v === 0) v = r.int(a, b);
  return v;
};

/** Цэгийн координатын асуулт: зөв хариу + түгээмэл алдаанууд */
function pointQuestion(text: string, ans: [number, number], wrong: [number, number][], steps: string[]) {
  const right = pt(...ans);
  return { text, ans: pick(right), wrong: [...new Set(wrong.map((w) => pt(...w)))].filter((w) => w !== right), steps };
}

/* 13. Үндсэн байгуулалтууд */
const constructions: Generator = (level, r) => {
  if (level === 0) {
    const L = r.int(3, 24) * 2;
    return {
      text: `AB хэрчмийн урт ${L} см. Дундаж перпендикуляр нь AB-г огтлох M цэгт хуваана. AM хэдэн см вэ?`,
      ans: num(L / 2, "см"),
      wrong: wn([L, L / 4, L / 2 + 1], "см"),
      steps: ["Дундаж перпендикуляр хэрчмийг тэнцүү хоёр хуваана.", `AM = ${L} : 2 = ${L / 2} см`],
    };
  }
  if (level === 1) {
    const a = r.int(15, 85) * 2;
    return {
      text: `∠ABC = ${a}°. BD нь энэ өнцгийн биссектрис бол ∠ABD хэдэн градус вэ?`,
      ans: num(a / 2, "°"),
      wrong: wn([a, 180 - a, 90 - a / 2 === a / 2 ? a / 2 + 10 : 90 - a / 2], "°"),
      steps: ["Биссектрис өнцгийг тэнцүү хоёр хуваана.", `${a}° : 2 = ${a / 2}°`],
    };
  }
  if (level === 2) {
    const m = r.int(3, 15);
    const ab = r.int(2, 2 * m - 1);
    return {
      text: `M цэг AB хэрчмийн дундаж перпендикуляр дээр оршино. MA = ${m} см, AB = ${ab} см бол MB хэдэн см вэ?`,
      ans: num(m, "см"),
      wrong: wn([ab, ab / 2, m + ab / 2].map((v) => Math.round(v * 10) / 10), "см"),
      steps: ["Дундаж перпендикуляр дээрх цэг бүр хэрчмийн хоёр үзүүрээс ижил зайтай.", `MB = MA = ${m} см`],
    };
  }
  if (r.next() < 0.7) {
    // Гурвалжны өнцгийн биссектрис
    const a = r.int(4, 16) * 5;
    const b = r.int(4, 16) * 5;
    const c = 180 - a - b;
    if (c < 20) return constructions(3, r);
    return {
      text: `ABC гурвалжинд ∠A = ${a}°, ∠B = ${b}°. C оройн биссектрис ∠C-г тэнцүү хоёр хуваана. Хуваагдсан нэг өнцөг хэдэн градус вэ?`,
      ans: num(c / 2, "°"),
      wrong: wn([c, (a + b) / 2, 90 - c / 2 === c / 2 ? c / 2 + 5 : 90 - c / 2], "°"),
      steps: [`Гурвалжны өнцгүүдийн нийлбэр 180°: ∠C = 180° − ${a}° − ${b}° = ${c}°.`, `Биссектрис: ${c}° : 2 = ${fmt(c / 2)}°`],
    };
  }
  const q = r.pick([
    {
      text: "Гурвалжны гурван биссектрисийн огтлолцлын цэг юу вэ?",
      ans: "Багтсан тойргийн төв",
      why: "Биссектрис дээрх цэг өнцгийн хоёр талаас ижил зайтай тул гурван талаас ижил зайтай цэг — багтсан тойргийн төв.",
    },
    {
      text: "Гурвалжны талуудын дундаж перпендикуляруудын огтлолцлын цэг юу вэ?",
      ans: "Багтаасан тойргийн төв",
      why: "Дундаж перпендикуляр дээрх цэг хэрчмийн үзүүрүүдээс ижил зайтай тул гурван оройгоос ижил зайтай цэг — багтаасан тойргийн төв.",
    },
    {
      text: "Гурвалжны медиануудын огтлолцлын цэг юу вэ?",
      ans: "Хүндийн төв",
      why: "Медиан нь оройг эсрэг талын дундаж цэгтэй холбоно. Гурван медиан хүндийн төвд огтлолцоно.",
    },
  ]);
  const all = ["Багтсан тойргийн төв", "Багтаасан тойргийн төв", "Хүндийн төв", "Өндрүүдийн огтлолцлын цэг"];
  return { text: q.text, ans: pick(q.ans), wrong: all.filter((a) => a !== q.ans), steps: [q.why] };
};

/* 14. Дүрсийн тэгш хэмт чанар */
const symmetry: Generator = (level, r) => {
  const shapes = [
    { n: 3, name: "Зөв гурвалжин" },
    { n: 4, name: "Квадрат" },
    { n: 5, name: "Зөв таван өнцөгт" },
    { n: 6, name: "Зөв зургаан өнцөгт" },
    { n: 8, name: "Зөв найман өнцөгт" },
    { n: 9, name: "Зөв есөн өнцөгт" },
    { n: 10, name: "Зөв арван өнцөгт" },
    { n: 12, name: "Зөв арван хоёр өнцөгт" },
    { n: 2, name: "Тэгш өнцөгт (квадрат биш)" },
    { n: 2, name: "Ромб (квадрат биш)" },
  ];
  if (level === 0) {
    const s = r.pick(shapes);
    return {
      text: `${s.name} хэдэн тэгш хэмийн тэнхлэгтэй вэ?`,
      ans: num(s.n),
      wrong: wn([s.n / 2 === Math.round(s.n / 2) ? s.n / 2 : s.n - 1, s.n * 2, 1]),
      steps: [
        s.n === 2
          ? `${s.name.split(" ")[0]} зөвхөн эсрэг талуудын (эсвэл диагоналиудын) дагуух 2 тэнхлэгтэй.`
          : "Зөв n өнцөгт n тэгш хэмийн тэнхлэгтэй.",
        `${s.name}: ${s.n} тэнхлэг`,
      ],
    };
  }
  if (level === 1) {
    const s = r.pick(shapes);
    return {
      text: `${s.name}-ийг төвийнх нь хувьд хамгийн багадаа хэдэн градусаар эргүүлэхэд өөртэйгөө давхцах вэ?`,
      ans: num(360 / s.n, "°"),
      wrong: wn([180, 360 / (s.n * 2), (180 * (s.n - 2)) / s.n].filter((v) => v !== 360 / s.n).slice(0, 3), "°"),
      steps: [
        s.n === 2
          ? `${s.name.split(" ")[0]} төвийнхөө хувьд 180°-аар эргэхэд л өөртэйгөө давхцана.`
          : "Зөв n өнцөгтийн эргэлтийн тэгш хэмийн хамгийн бага өнцөг 360° : n.",
        `360° : ${s.n} = ${fmt(360 / s.n)}°`,
      ],
    };
  }
  const x = nz(r, -7, 7);
  const y = nz(r, -7, 7);
  if (level === 2) {
    const axis = r.pick(["Ox", "Oy"] as const);
    const ans: [number, number] = axis === "Ox" ? [x, -y] : [-x, y];
    return pointQuestion(
      `A${pt(x, y)} цэгийг ${axis} тэнхлэгийн хувьд тэгш хэмтэй буулгав. Шинэ цэгийн координат?`,
      ans,
      [axis === "Ox" ? [-x, y] : [x, -y], [-x, -y], [y, x]],
      [`${axis} тэнхлэгийн хувьд буулгахад ${axis === "Ox" ? "x хэвээр, y-ийн тэмдэг" : "y хэвээр, x-ийн тэмдэг"} солигдоно.`, `${pt(x, y)} → ${pt(...ans)}`],
    );
  }
  const a = r.int(-3, 4);
  return pointQuestion(
    `A${pt(x, y)} цэгийг x = ${fmt(a)} шулууны хувьд тэгш хэмтэй буулгав. Шинэ цэгийн координат?`,
    [2 * a - x, y],
    [[-x, y], [x, 2 * a - y], [2 * a + x, y]],
    [`x = ${fmt(a)} шулуунаас A цэг ${fmt(x - a)} нэгж зайтай. Нөгөө талд ижил зайд буулгана.`, `x' = 2 · ${fmt(a)} − ${fmt(x)} = ${fmt(2 * a - x)}, y хэвээр: ${pt(2 * a - x, y)}`],
  );
};

/* 15. Эргүүлэлт, дараалсан хувиргалт */
const rotation: Generator = (level, r) => {
  const x = nz(r, -6, 6);
  let y = nz(r, -6, 6);
  if (Math.abs(x) === Math.abs(y)) y = y + (y > 0 ? 1 : -1);
  const cases = [
    { text: "O цэгийн хувьд 180°-аар эргүүлэв", ans: [-x, -y] as [number, number], rule: "(x; y) → (−x; −y)" },
    { text: "O цэгийн хувьд цагийн зүүний эсрэг 90°-аар эргүүлэв", ans: [-y, x] as [number, number], rule: "(x; y) → (−y; x)" },
    { text: "O цэгийн хувьд цагийн зүүний дагуу 90°-аар эргүүлэв", ans: [y, -x] as [number, number], rule: "(x; y) → (y; −x)" },
  ];
  if (level <= 2) {
    const c = cases[level];
    const wrong = cases.filter((o) => o !== c).map((o) => o.ans);
    return pointQuestion(`A${pt(x, y)} цэгийг ${c.text}. Шинэ цэгийн координат?`, c.ans, [...wrong, [y, x]], [`Дүрэм: ${c.rule}.`, `${pt(x, y)} → ${pt(...c.ans)}`]);
  }
  // Ox тэнхлэгийн хувьд буулгаад 180° эргүүлэх
  const step1: [number, number] = [x, -y];
  const ans: [number, number] = [-x, y];
  return pointQuestion(
    `A${pt(x, y)} цэгийг эхлээд Ox тэнхлэгийн хувьд тэгш хэмтэй буулгаад, дараа нь O цэгийн хувьд 180°-аар эргүүлэв. Эцсийн цэг?`,
    ans,
    [step1, [-x, -y], [x, y]],
    [`Ox-ийн хувьд: ${pt(x, y)} → ${pt(...step1)}.`, `180° эргүүлэлт: ${pt(...step1)} → ${pt(...ans)} (энэ нь Oy-ийн хувьд буулгахтай адил).`],
  );
};

/* 16. Хэрчмийн дундаж цэгийн координат */
const midpoint: Generator = (level, r) => {
  if (level === 0) {
    const a = r.int(-12, 6);
    const b = a + r.int(1, 10) * 2;
    return {
      text: `Тооны шулуун дээр A(${fmt(a)}) ба B(${fmt(b)}) цэгүүд байна. AB хэрчмийн дундаж цэгийн координат?`,
      ans: num((a + b) / 2),
      wrong: wn([(b - a) / 2, a + b, (a + b) / 2 + 1]),
      steps: ["Дундаж цэг = (a + b) / 2", `(${fmt(a)} + ${fmt(b)}) / 2 = ${fmt((a + b) / 2)}`],
    };
  }
  const x1 = r.int(-8, 8);
  const y1 = r.int(-8, 8);
  const even = level === 1;
  const x2 = x1 + (even ? 2 * r.int(-4, 4) : 2 * r.int(-4, 4) + 1);
  const y2 = y1 + (even ? 2 * r.int(-4, 4) : 2 * r.int(-4, 4) + 1);
  const m: [number, number] = [(x1 + x2) / 2, (y1 + y2) / 2];
  if (level <= 2) {
    return pointQuestion(
      `A${pt(x1, y1)}, B${pt(x2, y2)} бол AB хэрчмийн дундаж цэг M-ийн координат?`,
      m,
      [[(x2 - x1) / 2, (y2 - y1) / 2], [x1 + x2, y1 + y2], [m[0], -m[1]], [m[1], m[0]], [m[0] + 1, m[1]], [-m[0], m[1] - 1]],
      ["M = ((x₁ + x₂)/2; (y₁ + y₂)/2)", `M = ((${fmt(x1)} + ${fmt(x2)})/2; (${fmt(y1)} + ${fmt(y2)})/2) = ${pt(...m)}`],
    );
  }
  return pointQuestion(
    `A${pt(x1, y1)} ба AB хэрчмийн дундаж цэг M${pt(...m)} бол B цэгийн координат?`,
    [x2, y2],
    [[(x1 + m[0]) / 2, (y1 + m[1]) / 2], [m[0] - x1, m[1] - y1], [2 * m[0] + x1, 2 * m[1] + y1]],
    ["B = (2xₘ − x₁; 2yₘ − y₁)", `B = (2 · ${fmt(m[0])} − ${fmt(x1)}; 2 · ${fmt(m[1])} − ${fmt(y1)}) = ${pt(x2, y2)}`],
  );
};

export const GEOMETRY_GENERATORS = [constructions, symmetry, rotation, midpoint];
