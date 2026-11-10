/* Хариу шалгах (интерактив даалгавар) */

import type { Answerable } from "@/data/interaktiv";

export type Verdict = "ok" | "unreduced" | "wrong" | "empty";

export function gcd(a: number, b: number) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** Хоосон зай, урт зураас, таслалыг жигдэлнэ: " −3,5 " → "-3.5" */
export function normalize(s: string) {
  return String(s).trim().replace(/\s+/g, "").replace(/[−–]/g, "-").replace(",", ".");
}

/** Тоо, бутархай, сонголтот хариуг шалгана. Сонголтын үед `raw` нь сонголтын индекс. */
export function judge(item: Answerable, raw: string): Verdict {
  if (item.type === "choice") {
    if (raw === "") return "empty";
    return Number(raw) === item.answer ? "ok" : "wrong";
  }
  const s = normalize(raw);
  if (!s) return "empty";
  if (item.type === "frac") {
    const m = s.match(/^(-?\d+)\/(-?\d+)$/);
    if (!m || Number(m[2]) === 0) return "wrong";
    const n = Number(m[1]);
    const d = Number(m[2]);
    if (n * item.answer[1] !== d * item.answer[0]) return "wrong";
    return gcd(n, d) === 1 ? "ok" : "unreduced";
  }
  if (!/^-?\d+(\.\d+)?$/.test(s)) return "wrong";
  return Math.abs(Number(s) - item.answer) < 1e-9 ? "ok" : "wrong";
}

/** Зөв хариуг харуулах текст */
export function answerText(item: Answerable) {
  if (item.type === "frac") return `${item.answer[0]}/${item.answer[1]}`;
  if (item.type === "choice") return item.choices[item.answer];
  return String(item.answer).replace("-", "−") + (item.unit ? ` ${item.unit}` : "");
}
