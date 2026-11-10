"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { LinkList } from "@/components/ui/Lists";
import { Plate } from "@/components/ui/Plate";
import { MOTIONS, MOTION_PAGES, MOTION_PURPOSES, MOTION_TRIGGERS, type Motion } from "@/data/styleguide";
import { cn } from "@/lib/cn";

const rise = (i: number, ms = 700): CSSProperties => ({ animation: `sheet-in ${ms}ms cubic-bezier(.2,0,0,1) ${i * 80}ms backwards` });

/** Тоо 0-ээс гүйх жижиг демо (rAF callback дотор state шинэчилнэ) */
function CountDemo() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const target = 1000;
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, (now - start) / 1600);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  return <span className="tabular font-display text-heading leading-cap font-medium tracking-stat text-accent">{n}</span>;
}

function BarDemo() {
  const [full, setFull] = useState(false);
  return (
    <div className="flex w-full flex-col gap-2">
      <span aria-hidden="true" className="h-2 w-full bg-s-border">
        <span className="block h-full bg-ok transition-[width] duration-500" style={{ width: full ? "90%" : "20%" }} />
      </span>
      <button type="button" onClick={() => setFull((v) => !v)} className="self-start text-eyebrow uppercase underline underline-offset-4">
        Явц өөрчлөх
      </button>
    </div>
  );
}

function Demo({ kind }: { kind: string }) {
  switch (kind) {
    case "reveal":
      return (
        <div className="grid w-full grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-12 bg-accent-muted" style={rise(i)} />
          ))}
        </div>
      );
    case "sheet":
      return (
        <ul className="flex flex-col gap-1 font-display text-title font-bold uppercase">
          {["Нүүр", "Математик", "Хоцрогдол"].map((t, i) => (
            <li key={t} style={{ animation: `sheet-in 320ms cubic-bezier(.2,0,0,1) ${i * 55}ms backwards` }}>
              {t}
            </li>
          ))}
        </ul>
      );
    case "flood":
      return <Button as="span">Заагаад үз</Button>;
    case "plate":
      return <Plate src="/assets/course-2.png" sizes="200px" className="aspect-[4/3] w-48" />;
    case "dim":
      return (
        <div className="group/grid grid w-full grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-14 bg-surface-black transition-opacity duration-700 ease-plate group-hover/grid:not-hover:opacity-30" />
          ))}
        </div>
      );
    case "arrow":
      return <LinkList items={[{ href: "#motion", label: "Заагаад үз" }]} />;
    case "count":
      return <CountDemo />;
    case "ring":
      return (
        <span className="relative inline-block size-3 bg-accent">
          <span aria-hidden="true" className="live-ring pointer-events-none absolute -inset-1 border border-accent" />
        </span>
      );
    case "bar":
      return <BarDemo />;
    default:
      return null;
  }
}

function MotionCard({ m }: { m: Motion }) {
  const [run, setRun] = useState(0);
  const replayable = ["reveal", "sheet", "count"].includes(m.demo);
  return (
    <li className="grid gap-4 border-b border-s-border py-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="flex flex-col gap-2">
        <p className="flex flex-wrap items-center gap-2">
          <strong className="font-display text-title uppercase">{m.name}</strong>
          <code className="text-eyebrow text-s-sub">{m.slug}</code>
          <span className="bg-accent-muted px-1.5 text-eyebrow uppercase">{m.purpose}</span>
        </p>
        <p className="text-body leading-display">{m.text}</p>
        <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-eyebrow leading-display">
          <dt className="text-s-sub">Үүсгэгч</dt>
          <dd>{m.trigger}</dd>
          <dt className="text-s-sub">Хуудас</dt>
          <dd>{m.pages.join(", ")}</dd>
          <dt className="text-s-sub">Хаана</dt>
          <dd className="flex flex-wrap gap-x-2">
            {m.where.map((w) => (
              <code key={w}>{w}</code>
            ))}
          </dd>
          <dt className="text-s-sub">Тохиргоо</dt>
          <dd>{m.config}</dd>
          <dt className="text-s-sub">Reduced</dt>
          <dd>{m.reduced}</dd>
        </dl>
      </div>
      <div className="flex flex-col gap-2">
        <div key={run} className="flex min-h-28 items-center justify-center border border-s-border bg-s-raised p-4">
          <Demo kind={m.demo} />
        </div>
        {replayable && (
          <button type="button" onClick={() => setRun((r) => r + 1)} className="self-start text-eyebrow font-bold uppercase underline decoration-accent decoration-2 underline-offset-4 hover:text-accent">
            ▶ Дахин тоглуулах
          </button>
        )}
      </div>
    </li>
  );
}

type Filter = { purpose: string[]; trigger: string[]; page: string[] };

/** Сайт дээрх бүх хөдөлгөөний бүртгэл — зориулалт, үүсгэгч, хуудсаар шүүнэ */
export function MotionRegistry() {
  const [f, setF] = useState<Filter>({ purpose: [], trigger: [], page: [] });
  const toggle = (k: keyof Filter, v: string) => setF((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const match = (m: Motion) =>
    (!f.purpose.length || f.purpose.includes(m.purpose)) &&
    (!f.trigger.length || f.trigger.includes(m.trigger)) &&
    (!f.page.length || m.pages.some((p) => f.page.includes(p) || p === "Бүх хуудас"));
  const shown = MOTIONS.filter(match);
  const any = f.purpose.length + f.trigger.length + f.page.length > 0;

  const groups: [keyof Filter, string, readonly string[]][] = [
    ["purpose", "Зориулалт", MOTION_PURPOSES],
    ["trigger", "Үүсгэгч", MOTION_TRIGGERS],
    ["page", "Хуудас", MOTION_PAGES.filter((p) => p !== "Бүх хуудас")],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 border border-s-border bg-s-raised p-4">
        {groups.map(([k, label, opts]) => (
          <div key={k} role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
            <span className="w-24 text-eyebrow uppercase text-s-sub">{label}</span>
            {opts.map((o) => {
              const on = f[k].includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(k, o)}
                  className={cn("border px-2.5 py-1 text-eyebrow transition-colors", on ? "border-accent bg-accent text-foreground" : "border-s-border hover:border-accent")}
                >
                  {o}
                </button>
              );
            })}
          </div>
        ))}
        <p className="flex items-center gap-4 text-eyebrow text-s-sub" aria-live="polite">
          {shown.length} / {MOTIONS.length} хөдөлгөөн
          {any && (
            <button type="button" onClick={() => setF({ purpose: [], trigger: [], page: [] })} className="uppercase underline underline-offset-4 hover:text-accent">
              Цэвэрлэх
            </button>
          )}
        </p>
      </div>
      {shown.length ? (
        <ul className="flex flex-col">
          {shown.map((m) => (
            <MotionCard key={m.slug} m={m} />
          ))}
        </ul>
      ) : (
        <p className="text-body text-s-sub">Сонгосон tag-уудад тохирох хөдөлгөөн алга.</p>
      )}
    </div>
  );
}
