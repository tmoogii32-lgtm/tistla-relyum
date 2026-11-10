import Image from "next/image";
import { Reveal } from "@/components/effects/Reveal";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { CheckList } from "@/components/ui/Lists";
import { LEVELS } from "@/data/levels";
import { STRANDS, type Strand } from "@/data/math";
import { PRACTICE_APP_URL } from "@/lib/site";

/** 🌱 Суурь → 🏆 Гүнзгий 4 түвшин. Сүүлийнх нь accent хүрээтэй. */
export function LevelList() {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {LEVELS.map((level, i) => (
        <Reveal as="li" key={level.name} delay={i * 80}>
          <BracketCard accent={i === LEVELS.length - 1} className="flex h-full flex-col gap-2 px-6 py-7">
            <span aria-hidden="true" className="text-[2rem] leading-none">
              {level.icon}
            </span>
            <h3 className="font-display text-title leading-headline font-bold uppercase">
              <span className="mr-2 text-accent">{i + 1}.</span>
              {level.name}
            </h3>
            <p className="text-body leading-display text-s-sub">{level.text}</p>
          </BracketCard>
        </Reveal>
      ))}
    </ol>
  );
}

export function CriteriaItem({ strand }: { strand: Strand }) {
  return (
    <BracketCard className="grid h-full items-start gap-6 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <Image src={strand.image} width={400} height={300} alt="" className="h-auto w-full max-w-40" />
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-title leading-headline font-bold uppercase">{strand.title}</h3>
        <CheckList items={strand.criteria} />
      </div>
    </BracketCard>
  );
}

export function CriteriaGrid() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {STRANDS.map((s, i) => (
        <Reveal key={s.id} delay={(i % 2) * 80}>
          <CriteriaItem strand={s} />
        </Reveal>
      ))}
    </div>
  );
}

/** Хуудасны төгсгөлийн уриалга */
export function CtaBanner() {
  return (
    <Reveal>
      <BracketCard accent className="flex flex-col items-start justify-between gap-6 bg-s-raised p-8 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-heading leading-headline font-bold uppercase">Сурагчдын гүйцэтгэлийг бүртгэх</h3>
          <p className="text-body leading-display text-s-sub">
            Даалгавар бүрийн дүнг сурагчид бүртгэж, хоцрогдолтой сэдвийг тодорхойлоорой.
          </p>
        </div>
        <Actions>
          <Button href="/hotsrogdol">Хоцрогдлыг тооцох</Button>
          <Button href={PRACTICE_APP_URL}>Бодлого бодох</Button>
        </Actions>
      </BracketCard>
    </Reveal>
  );
}
