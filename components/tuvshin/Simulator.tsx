"use client";

import { useState } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { Field, inputClass } from "@/components/ui/Form";
import { CheckList } from "@/components/ui/Lists";
import { recommend, SIM_OPTIONS, type SimInput } from "@/data/tuvshin";

/** Ангийн нөхцөл → тохирох ялгаатай сургалтын стратеги */
export function Simulator() {
  const [input, setInput] = useState<SimInput>({
    gap: SIM_OPTIONS.gap.initial,
    resource: SIM_OPTIONS.resource.initial,
    tech: SIM_OPTIONS.tech.initial,
  });
  const rec = recommend(input);
  const keys = Object.keys(SIM_OPTIONS) as (keyof typeof SIM_OPTIONS)[];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <BracketCard className="flex flex-col gap-5 bg-s-raised p-6">
        {keys.map((k) => (
          <Field key={k} label={SIM_OPTIONS[k].label}>
            <select value={input[k]} onChange={(e) => setInput((s) => ({ ...s, [k]: e.target.value }))} className={inputClass}>
              {SIM_OPTIONS[k].options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        ))}
      </BracketCard>

      <div data-surface="light" aria-live="polite">
        <BracketCard accent className="flex h-full flex-col justify-between gap-4 p-6 sm:p-8">
          <div className="flex flex-col gap-3">
            <span className="self-start bg-accent px-3 py-1 text-eyebrow font-bold uppercase text-foreground">{rec.badge}</span>
            <h3 className="font-display text-heading leading-headline font-bold uppercase">{rec.title}</h3>
            <p className="text-body leading-display text-s-sub">{rec.desc}</p>
          </div>
          <div className="border-t border-s-border pt-3">
            <h4 className="mb-2 text-eyebrow font-bold uppercase">Хэрэгжүүлэх зөвлөмж алхмууд:</h4>
            <CheckList items={rec.steps} />
          </div>
          <p className="text-eyebrow text-s-faint italic">* Энэхүү зөвлөмж нь олон улсын 2020–2025 оны мета-шинжилгээний туршлагад үндэслэгдсэн.</p>
        </BracketCard>
      </div>
    </div>
  );
}
