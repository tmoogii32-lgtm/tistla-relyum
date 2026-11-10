import type { ReactNode } from "react";
import { Reveal } from "@/components/effects/Reveal";
import { Actions, Button } from "@/components/ui/Button";
import { Section, type Surface } from "@/components/ui/Section";
import { StatCard } from "@/components/ui/StatCard";
import { SectionTitle } from "@/components/ui/Typography";

type Props = {
  surface: Surface;
  tagline: string;
  title: string;
  lead: string;
  stats: { value: ReactNode; label: string }[];
  /** Баруун талын видео / зураг */
  media: ReactNode;
};

/** Тоон үзүүлэлт + медиа (хуучин Layout 26, нүүрэнд 2 удаа) */
export function StatsSection({ surface, tagline, title, lead, stats, media }: Props) {
  return (
    <Section surface={surface}>
      <div className="mx-auto flex w-full max-w-site flex-col items-stretch gap-12 lg:flex-row lg:items-center lg:gap-20">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <SectionTitle tagline={tagline} title={title} lead={lead} />
          <div className="grid gap-4 md:grid-cols-2">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <StatCard value={s.value} label={s.label} />
              </Reveal>
            ))}
          </div>
          <Reveal>
            <Actions>
              <Button href="#">Book</Button>
              <Button href="#" variant="link">
                More
              </Button>
            </Actions>
          </Reveal>
        </div>
        <Reveal className="flex min-w-0 flex-1">{media}</Reveal>
      </div>
    </Section>
  );
}
