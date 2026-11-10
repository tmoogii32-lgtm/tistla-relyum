import { Brackets } from "@/components/ui/BracketCard";
import { GoalList } from "@/components/ui/Lists";
import { Plate } from "@/components/ui/Plate";
import type { Strand } from "@/data/math";

/** Агуулгын хүрээ: чимэглэл зураг + суралцахуйн зорилтууд */
export function StrandCard({ strand, index }: { strand: Strand; index: number }) {
  return (
    <article className="group flex h-full flex-col gap-4">
      <Plate
        src={strand.image}
        alt={strand.imageAlt}
        fit="contain"
        sizes="(min-width: 768px) 40vw, 100vw"
        className="aspect-[4/3] w-full"
        fillClassName="bg-surface-dark"
      />
      <div className="relative flex flex-1 flex-col gap-3 p-6">
        <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">Хүрээ {index + 1}</p>
        <h3 className="font-display text-heading leading-headline font-bold uppercase">{strand.title}</h3>
        <GoalList items={strand.goals} className="mt-2" />
        <Brackets />
      </div>
    </article>
  );
}
