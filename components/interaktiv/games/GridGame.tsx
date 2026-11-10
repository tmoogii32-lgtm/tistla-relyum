"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Actions, Button } from "@/components/ui/Button";
import { rng } from "@/lib/problems/core";
import type { GameDef, GridRound } from "@/lib/miniGames";
import { cn } from "@/lib/cn";

type Props = {
  def: Extract<GameDef, { kind: "grid" }>;
  seed: string;
  onFinish: (score: number) => void;
};

const CELL = 32;

/** Координатын хавтгай дээр зөв цэгийг дарах тоглоом */
export function GridGame({ def, seed, onFinish }: Props) {
  const [rounds] = useState<GridRound[]>(() => Array.from({ length: def.rounds }, (_, i) => def.make(i, rng(`${seed}|${i}`))));
  const [idx, setIdx] = useState(0);
  const [clicks, setClicks] = useState<[number, number][]>([]);
  const reported = useRef(false);

  const n = def.size;
  const span = n * 2;
  const pad = 24;
  const size = span * CELL + pad * 2;
  const toX = (x: number) => pad + (x + n) * CELL;
  const toY = (y: number) => pad + (n - y) * CELL;

  const finished = idx >= rounds.length;
  const correctOf = (i: number) => clicks[i] && clicks[i][0] === rounds[i].target[0] && clicks[i][1] === rounds[i].target[1];
  const score = rounds.reduce((s, _, i) => s + (correctOf(i) ? def.pointsPerRound : 0), 0);

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onFinish(score);
    }
  }, [finished, score, onFinish]);

  if (finished) {
    return (
      <p role="status" className="font-display text-title uppercase">
        {rounds.filter((_, i) => correctOf(i)).length} / {rounds.length} эрдэнэс оллоо · {score} оноо
      </p>
    );
  }

  const round = rounds[idx];
  const answered = clicks.length > idx;
  const ok = correctOf(idx);
  const choose = (x: number, y: number) => {
    if (!answered) setClicks((c) => [...c, [x, y]]);
  };
  const onKey = (e: KeyboardEvent, x: number, y: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(x, y);
    }
  };

  const range = Array.from({ length: span + 1 }, (_, i) => i - n);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-eyebrow font-medium tracking-eyebrow uppercase">
        <span>
          {idx + 1} / {rounds.length} · {def.pointsPerRound} оноо
        </span>
        <span className="font-display text-title text-accent">{score} оноо</span>
      </div>
      <p className="text-lead leading-display font-medium">{round.text}</p>

      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-md select-none" role="group" aria-label="Координатын хавтгай">
        {range.map((v) => (
          <g key={v} className="stroke-s-border">
            <line x1={toX(v)} x2={toX(v)} y1={toY(n)} y2={toY(-n)} />
            <line x1={toX(-n)} x2={toX(n)} y1={toY(v)} y2={toY(v)} />
          </g>
        ))}
        <line x1={toX(-n)} x2={toX(n)} y1={toY(0)} y2={toY(0)} className="stroke-current" strokeWidth={2} />
        <line x1={toX(0)} x2={toX(0)} y1={toY(-n)} y2={toY(n)} className="stroke-current" strokeWidth={2} />
        <text x={toX(n) + 4} y={toY(0) - 6} className="fill-current text-[12px] font-bold">x</text>
        <text x={toX(0) + 6} y={toY(n) + 2} className="fill-current text-[12px] font-bold">y</text>
        {range.filter((v) => v !== 0).map((v) => (
          <g key={`l${v}`} className="fill-current text-[10px] opacity-70">
            <text x={toX(v)} y={toY(0) + 14} textAnchor="middle">{v}</text>
            <text x={toX(0) - 6} y={toY(v) + 3} textAnchor="end">{v}</text>
          </g>
        ))}
        {round.marks?.map((m) => (
          <g key={m.label}>
            <circle cx={toX(m.at[0])} cy={toY(m.at[1])} r={7} className="fill-warn" />
            <text x={toX(m.at[0]) + 9} y={toY(m.at[1]) - 9} className="fill-current text-[13px] font-bold">{m.label}</text>
          </g>
        ))}
        {range.map((x) =>
          range.map((y) => {
            const isClick = answered && clicks[idx][0] === x && clicks[idx][1] === y;
            const isTarget = answered && round.target[0] === x && round.target[1] === y;
            return (
              <circle
                key={`${x},${y}`}
                cx={toX(x)}
                cy={toY(y)}
                r={isClick || isTarget ? 8 : 6}
                tabIndex={answered ? -1 : 0}
                role="button"
                aria-label={`(${x}; ${y})`}
                onClick={() => choose(x, y)}
                onKeyDown={(e) => onKey(e, x, y)}
                className={cn(
                  "outline-none",
                  !answered && "cursor-pointer fill-transparent hover:fill-accent focus:fill-accent",
                  answered && isTarget && "fill-ok",
                  answered && isClick && !isTarget && "fill-danger",
                  answered && !isClick && !isTarget && "fill-transparent",
                )}
              />
            );
          }),
        )}
      </svg>

      {answered && (
        <div className="flex flex-col gap-4">
          <div role="status" className={cn("border-l-4 p-4", ok ? "border-ok bg-ok/10" : "border-danger bg-danger/10")}>
            <strong className="text-label">{ok ? `Эрдэнэс оллоо! +${def.pointsPerRound} оноо 💎` : `Буруу цэг (${clicks[idx][0]}; ${clicks[idx][1]}). Ногоон цэг — зөв хариу.`}</strong>
            <p className="text-body">{round.explain}</p>
          </div>
          <Actions>
            <Button onClick={() => setIdx((i) => i + 1)}>{idx + 1 === rounds.length ? "Дүн харах" : "Дараах"}</Button>
          </Actions>
        </div>
      )}
    </div>
  );
}
