import Image from "next/image";
import { Reveal } from "@/components/effects/Reveal";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";
import { STRANDS } from "@/data/math";
import { TEXTBOOK_URL, VIDEO_LESSONS_URL } from "@/lib/site";

/** Дугаартай бүлгийн карт */
export function ChapterCard({ num, title, topics }: { num: number; title: string; topics: string[] }) {
  return (
    <BracketCard className="flex h-full flex-col gap-3">
      <h3 className="flex items-center gap-3 font-display text-title leading-headline font-bold uppercase">
        <span className="grid size-7 shrink-0 place-items-center bg-accent font-sans text-body text-foreground">{num}</span>
        {title}
      </h3>
      <ul className="flex flex-col gap-1.5 text-body leading-display text-s-sub">
        {topics.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </BracketCard>
  );
}

export function Textbook() {
  return (
    <Section id="surah-bichig" surface="dark">
      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(16rem,5fr)_7fr] lg:gap-20">
        <Reveal className="flex justify-center bg-[radial-gradient(circle_at_50%_45%,var(--accent-muted),transparent_65%)] px-6 py-12">
          <Image src="/assets/math/textbook.svg" width={320} height={400} alt="Математик 7 сурах бичиг" className="h-auto w-full max-w-80" />
        </Reveal>
        <div className="flex flex-col gap-10">
          <SectionTitle
            tagline="02"
            title="7-р ангийн сурах бичиг"
            lead="&quot;Математик 7&quot; сурах бичгийг цахимаар уншиж, сэдэв бүрийн видео хичээлийг БШУЯ-ны цахим контентын сангаас үзэх боломжтой."
          />
          <div className="grid gap-6 sm:grid-cols-2">
            {STRANDS.map((s, i) => (
              <Reveal key={s.id} delay={(i % 2) * 80}>
                <ChapterCard num={i + 1} title={s.title} topics={s.chapters} />
              </Reveal>
            ))}
          </div>
          <Reveal>
            <Actions>
              <Button href={TEXTBOOK_URL}>Цахим сурах бичиг</Button>
              <Button href={VIDEO_LESSONS_URL}>Видео хичээл</Button>
            </Actions>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
