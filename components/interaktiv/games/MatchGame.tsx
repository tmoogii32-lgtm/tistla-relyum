"use client";

import { useEffect, useRef, useState } from "react";
import { MathText } from "@/components/daalgavar/MathText";
import { rng } from "@/lib/problems/core";
import type { GameDef } from "@/lib/miniGames";
import { cn } from "@/lib/cn";

type Props = {
  def: Extract<GameDef, { kind: "match" }>;
  seed: string;
  onFinish: (score: number) => void;
};

type Card = { id: string; pair: number; text: string };

/** Хос олох: нэг картыг сонгоод тэнцүү утгатай картыг сонгоно */
export function MatchGame({ def, seed, onFinish }: Props) {
  const [cards] = useState<Card[]>(() => {
    const r = rng(seed);
    const pairs = def.make(r);
    return r.shuffle(pairs.flatMap(([a, b], i) => [{ id: `${i}a`, pair: i, text: a }, { id: `${i}b`, pair: i, text: b }]));
  });
  const [selected, setSelected] = useState<Card | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [msg, setMsg] = useState("");
  const reported = useRef(false);

  const finished = matched.length === def.pairs;
  const score = Math.max(0, matched.length * def.pointsPerPair - mistakes * def.penalty);

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onFinish(score);
    }
  }, [finished, score, onFinish]);

  const pick = (c: Card) => {
    if (matched.includes(c.pair) || wrong.length) return;
    if (!selected) return setSelected(c);
    if (selected.id === c.id) return setSelected(null);
    if (selected.pair === c.pair) {
      setMatched((m) => [...m, c.pair]);
      setMsg(`Зөв хос! +${def.pointsPerPair} оноо`);
    } else {
      setMistakes((m) => m + 1);
      setWrong([selected.id, c.id]);
      setMsg(`Тэнцүү биш. −${def.penalty} оноо`);
      setTimeout(() => setWrong([]), 700);
    }
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-eyebrow font-medium tracking-eyebrow uppercase">
        <span>
          {matched.length} / {def.pairs} хос · {mistakes} алдаа
        </span>
        <span className="font-display text-title text-accent">{score} оноо</span>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {cards.map((c) => {
          const done = matched.includes(c.pair);
          const isSel = selected?.id === c.id;
          const isWrong = wrong.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={isSel}
              disabled={done}
              onClick={() => pick(c)}
              className={cn(
                "grid min-h-20 cursor-pointer place-items-center border-2 p-2 font-display text-heading transition-colors",
                done && "cursor-default border-ok bg-ok/15 text-ok",
                !done && isSel && "border-accent bg-accent text-foreground",
                !done && isWrong && "border-danger bg-danger/15",
                !done && !isSel && !isWrong && "border-s-border hover:border-accent",
              )}
            >
              <MathText text={c.text} />
            </button>
          );
        })}
      </div>
      <p role="status" className="min-h-6 text-label">
        {finished ? `Бүх хосыг оллоо! ${score} оноо` : msg}
      </p>
    </div>
  );
}
