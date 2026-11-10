"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Утгыг браузерийн computed style-аас уншиж харуулна — globals.css өөрчлөгдөхөд styleguide автоматаар таарна.
   Утгыг DOM-д шууд бичдэг (state биш) тул hydration зөрөхгүй. */

type RGBA = [number, number, number, number];

/** "rgb(…)", "rgba(…)", "color(srgb r g b / a)" → [r,g,b,a] (0–255, a 0–1) */
export function parseColor(c: string): RGBA | null {
  let m = c.match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] ? alpha(m[4]) : 1];
  m = c.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/);
  if (m) return [Number(m[1]) * 255, Number(m[2]) * 255, Number(m[3]) * 255, m[4] ? alpha(m[4]) : 1];
  return null;
}
const alpha = (s: string) => (s.endsWith("%") ? Number(s.slice(0, -1)) / 100 : Number(s));

export function toHex([r, g, b, a]: RGBA) {
  const h = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}${a < 1 ? ` · ${Math.round(a * 100)}%` : ""}`;
}

/** Хагас тунгалаг өнгийг дэвсгэр дээр холино */
function over([r, g, b, a]: RGBA, [br, bg, bb]: RGBA): RGBA {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
}

function luminance([r, g, b]: RGBA) {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(fg: RGBA, bg: RGBA) {
  const a = luminance(over(fg, bg));
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Өнгөний хайрцаг + hex утга (+ контраст) */
export function Swatch({ cssVar, against, className }: { cssVar: string; against?: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const hex = useRef<HTMLSpanElement>(null);
  const ratio = useRef<HTMLSpanElement>(null);
  const bgProbe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!box.current || !hex.current) return;
    const c = parseColor(getComputedStyle(box.current).backgroundColor);
    hex.current.textContent = c ? toHex(c) : "—";
    if (against && ratio.current && bgProbe.current && c) {
      const bg = parseColor(getComputedStyle(bgProbe.current).backgroundColor);
      if (bg) {
        const r = contrast(c, bg);
        ratio.current.textContent = `${r.toFixed(1)}:1${r >= 4.5 ? " AA" : r >= 3 ? " AA large" : ""}`;
      }
    }
  }, [against]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div ref={box} className="h-16 w-full border border-s-border" style={{ background: `var(${cssVar})` }} />
      {against && <div ref={bgProbe} hidden style={{ background: `var(${against})` }} />}
      <code className="text-eyebrow break-all">{cssVar}</code>
      <span ref={hex} className="text-eyebrow text-s-sub tabular">
        …
      </span>
      {against && (
        <span className="text-eyebrow text-s-sub">
          <span ref={ratio}>…</span> · {against.replace("--", "")} дээр
        </span>
      )}
    </div>
  );
}

/** Нэг жижиг өнгөний цэг + hex (хүснэгтэд) */
export function ColorChip({ cssVar }: { cssVar: string }) {
  const box = useRef<HTMLSpanElement>(null);
  const hex = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!box.current || !hex.current) return;
    const c = parseColor(getComputedStyle(box.current).backgroundColor);
    hex.current.textContent = c ? toHex(c) : "—";
  }, []);
  return (
    <span className="inline-flex items-center gap-2">
      <span ref={box} className="inline-block size-5 shrink-0 rounded-full border border-s-border" style={{ background: `var(${cssVar})` }} />
      <span ref={hex} className="text-eyebrow tabular">
        …
      </span>
    </span>
  );
}

const FAMILY = (f: string) => (f.includes("Oswald") ? "Oswald" : f.includes("Space_Grotesk") || f.includes("Space Grotesk") ? "Space Grotesk" : f.includes("Inter") ? "Inter" : f.split(",")[0]);
const px = (v: string) => (v.endsWith("px") ? `${Math.round(parseFloat(v) * 10) / 10}px` : v);

/** Доторх эхний элементийн үсгийн бодит хэв маягийг "Oswald 700 · 55px/52px · 0px" хэлбэрээр */
export function TypeSpec({ children, label, className }: { children: ReactNode; label: ReactNode; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const spec = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = wrap.current?.firstElementChild as HTMLElement | null;
    if (!el || !spec.current) return;
    const s = getComputedStyle(el);
    const ls = s.letterSpacing === "normal" ? "0" : px(s.letterSpacing);
    spec.current.textContent = `${FAMILY(s.fontFamily)} ${s.fontWeight} · ${px(s.fontSize)}/${px(s.lineHeight)} · ${ls}`;
  }, []);
  return (
    <div className={cn("flex flex-col gap-2 border-b border-s-border py-5", className)}>
      <div ref={wrap}>{children}</div>
      <p className="flex flex-wrap gap-x-3 text-eyebrow text-s-sub">
        <code className="text-s-fg">{label}</code>
        <span>
          — <span ref={spec}>…</span>
        </span>
      </p>
    </div>
  );
}

/** CSS хувьсагчийн бодит утга (уян хатан clamp/media-ийг тооцсон) */
export function VarValue({ cssVar, prop = "fontSize" }: { cssVar: string; prop?: "fontSize" | "lineHeight" | "letterSpacing" | "raw" }) {
  const probe = useRef<HTMLSpanElement>(null);
  const out = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!probe.current || !out.current) return;
    if (prop === "raw") {
      out.current.textContent = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      return;
    }
    const v = getComputedStyle(probe.current)[prop];
    if (prop === "lineHeight") {
      const n = v.endsWith("px") ? parseFloat(v) / 100 : parseFloat(v);
      out.current.textContent = Number.isFinite(n) ? String(Math.round(n * 100) / 100) : v;
    } else out.current.textContent = px(v);
  }, [cssVar, prop]);
  return (
    <>
      <span
        ref={probe}
        hidden
        style={prop === "fontSize" ? { fontSize: `var(${cssVar})` } : prop === "lineHeight" ? { fontSize: "100px", lineHeight: `var(${cssVar})` } : prop === "letterSpacing" ? { letterSpacing: `var(${cssVar})` } : undefined}
      />
      <span ref={out} className="tabular">
        …
      </span>
    </>
  );
}
