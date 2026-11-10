"use client";

import Link from "next/link";
import { useState } from "react";
import { MathText } from "@/components/daalgavar/MathText";
import { BracketCard } from "@/components/ui/BracketCard";
import { inputClass } from "@/components/ui/Form";
import { FORMULA_CATEGORIES, FORMULAS, type Formula } from "@/data/tomyo";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/cn";

const SAVED_KEY = "tomyo-saved";
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const NO_SAVED: string[] = [];

const chip = (on: boolean) =>
  cn(
    "cursor-pointer border px-3 py-2 text-eyebrow font-semibold uppercase transition-colors",
    on ? "border-accent bg-accent text-foreground" : "border-s-border hover:border-accent",
  );

const norm = (s: string) => s.toLowerCase().replace(/\[\[|\]\]/g, "");

function matches(f: Formula, q: string) {
  if (!q) return true;
  const cat = FORMULA_CATEGORIES.find((c) => c.id === f.cat)?.title ?? "";
  const hay = norm([f.title, f.words, cat, ...f.f].join(" "));
  return norm(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

/**
 * Томьёоны сан: хайлт, ангилал, ☆ хадгалах (энэ браузерт), 🧠 цээжлэх, 📄 зөвхөн томьёо, 🖨 хэвлэх.
 */
export function FormulaBank() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [memorize, setMemorize] = useState(false);
  const [compact, setCompact] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [saved, setSaved] = useLocalStorage<string[]>(SAVED_KEY, NO_SAVED, isStringArray);

  const toggleSaved = (id: string) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const reveal = (id: string) => setRevealed((r) => new Set(r).add(id));

  const list = FORMULAS.filter((f) => (!cat || f.cat === cat) && (!savedOnly || saved.includes(f.id)) && matches(f, q));
  const groups = FORMULA_CATEGORIES.map((c) => ({ c, items: list.filter((f) => f.cat === c.id) })).filter((g) => g.items.length);

  return (
    <div className="flex flex-col gap-8">
      {/* Удирдлага — хэвлэхэд нуугдана */}
      <div className="flex flex-col gap-4 border-b border-s-border pb-6 print:hidden">
        <label className="relative block">
          <span className="sr-only">Томьёо хайх</span>
          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            🔍
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Томьёо хайх: талбай, куб, процент, медиан…"
            className={cn(inputClass, "pl-10 text-lead")}
          />
        </label>

        <div role="group" aria-label="Ангилал" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={!cat} onClick={() => setCat("")} className={chip(!cat)}>
            Бүгд ({FORMULAS.length})
          </button>
          {FORMULA_CATEGORIES.map((c) => (
            <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(cat === c.id ? "" : c.id)} className={chip(cat === c.id)}>
              {c.title}
            </button>
          ))}
        </div>

        <div role="group" aria-label="Харагдац" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly((v) => !v)} className={chip(savedOnly)}>
            ☆ Хадгалсан ({saved.length})
          </button>
          <button
            type="button"
            aria-pressed={memorize}
            onClick={() => {
              setMemorize((v) => !v);
              setRevealed(new Set());
            }}
            className={chip(memorize)}
          >
            🧠 Цээжлэх
          </button>
          <button type="button" aria-pressed={compact} onClick={() => setCompact((v) => !v)} className={chip(compact)}>
            📄 Зөвхөн томьёо
          </button>
          <button type="button" onClick={() => window.print()} className={chip(false)}>
            🖨 Хэвлэх
          </button>
        </div>

        {memorize && (
          <p className="text-body text-s-sub">
            Томьёо нуугдлаа. Гарчгийг нь уншаад томьёогоо цаасан дээр санаж бичээд, «Харах» дарж шалгаарай.
          </p>
        )}
      </div>

      {!groups.length && (
        <p className="py-10 text-center text-body text-s-sub">
          {savedOnly && !saved.length ? "Хадгалсан томьёо алга. Томьёоны ☆ дээр дарж хадгална." : "Тохирох томьёо олдсонгүй."}
        </p>
      )}

      {groups.map(({ c, items }) => (
        <section key={c.id} aria-labelledby={`cat-${c.id}`} className="flex flex-col gap-4">
          <h2 id={`cat-${c.id}`} className="flex flex-wrap items-baseline gap-x-3 font-display text-heading leading-headline font-bold uppercase">
            <span>{c.title}</span>
            <span className="text-body font-normal normal-case text-s-sub">{items.length} томьёо</span>
          </h2>
          <ul className={cn("grid gap-4", compact ? "sm:grid-cols-2 lg:grid-cols-3" : "lg:grid-cols-2")}>
            {items.map((f) => (
              <li key={f.id} id={f.id} className="scroll-mt-24 break-inside-avoid">
                <FormulaCard
                  f={f}
                  compact={compact}
                  hidden={memorize && !revealed.has(f.id)}
                  onReveal={() => reveal(f.id)}
                  saved={saved.includes(f.id)}
                  onToggleSaved={() => toggleSaved(f.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function FormulaCard({
  f,
  compact,
  hidden,
  onReveal,
  saved,
  onToggleSaved,
}: {
  f: Formula;
  compact: boolean;
  hidden: boolean;
  onReveal: () => void;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  return (
    <BracketCard className={cn("flex h-full flex-col gap-4 bg-s-raised", compact ? "p-4" : "p-5 sm:p-6")}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-title leading-headline font-bold uppercase">{f.title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          <span className="border border-s-border px-2 py-0.5 text-eyebrow text-s-sub">{f.grade ?? "7"}-р анги</span>
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? `${f.title} — хадгалснаас хасах` : `${f.title} — хадгалах`}
            onClick={onToggleSaved}
            className={cn("cursor-pointer text-title leading-none transition-colors print:hidden", saved ? "text-warn" : "text-s-sub hover:text-warn")}
          >
            {saved ? "★" : "☆"}
          </button>
        </div>
      </div>

      {hidden ? (
        <button
          type="button"
          onClick={onReveal}
          className="flex min-h-20 cursor-pointer items-center justify-center border border-dashed border-accent bg-s-bg px-4 py-3 text-label font-medium transition-colors hover:bg-accent-muted"
        >
          🧠 Санаж бичээд — Харах
        </button>
      ) : (
        <div className="flex flex-col gap-2 border-l-2 border-accent bg-s-bg px-4 py-3">
          {f.f.map((line) => (
            <p key={line} className="text-lead font-medium">
              <MathText text={line} />
            </p>
          ))}
        </div>
      )}

      {!compact && (
        <>
          <p className="text-body leading-display">{f.words}</p>
          <div className="flex flex-col gap-1 text-body leading-display">
            <p className="text-eyebrow font-bold uppercase text-accent">Жишээ</p>
            <p>
              <MathText text={f.ex.q} />
            </p>
            <p className={hidden ? "text-s-sub" : undefined}>
              → {hidden ? "томьёогоо шалгасны дараа харагдана" : <MathText text={f.ex.a} />}
            </p>
          </div>
          <p className="border-l-2 border-danger bg-danger/10 px-3 py-2 text-body leading-display">
            <span className="font-bold">⚠ Түгээмэл алдаа: </span>
            <MathText text={f.mistake} />
          </p>
          {f.onol && (
            <Link href={`/onol/${f.onol.replace(".", "-")}`} className="mt-auto text-eyebrow font-bold uppercase underline decoration-accent decoration-2 underline-offset-4 hover:text-accent print:hidden">
              Онол унших: {f.onol} →
            </Link>
          )}
        </>
      )}
    </BracketCard>
  );
}
